import Leads from "../model/leadModel.js";
import FacebookLead from '../model/facebookModel.js';

export const addLeadIndiaMartController = async(req,res,next)=>{
    try {
      const leadData = req.body.RESPONSE;
      const reponse = await Leads.create(leadData) 
      res.status(200).send("Lead saved successfully");
  } catch (err) {
    // console.error("Webhook error:", err);
    res.status(500).send("Duplicate saving lead");
  }
}

export const getLeadController = async (req, res, next) => {
    try {
        // Optional: Add pagination parameters
        const { page = 1, limit = 10 } = req.query;
        
        // Optional: Add filtering
        const filter = {};
        if (req.query.status) filter.status = req.query.status;
        if (req.query.source) filter.source = req.query.source;
        
        const leads = await Leads.find(filter)
            .limit(parseInt(limit))
            .skip((page - 1) * limit)
            .sort({ createdAt: -1 }); // Sort by newest first
        
        // Optional: Get total count for pagination info
        const total = await Leads.countDocuments(filter);
        
        res.status(200).json({
            success: true,
            data: leads,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                totalPages: Math.ceil(total / limit)
            }
        });
    } catch (err) {
        console.error("Error fetching leads:", err);
        res.status(500).json({
            success: false,
            message: "Error retrieving leads"
        });
    }
}

// Dashboard API for cards
export const getLeadStats = async (req, res, next) => {
  try {
    // Get today's date at start and end of day
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    // Execute queries sequentially
    const totalIndiaMartLeads = await Leads.countDocuments();
    const totalFacebookLeads = await FacebookLead.countDocuments();
    
    const newIndiaMartLeadsToday = await Leads.countDocuments({ 
      createdAt: { $gte: todayStart, $lte: todayEnd } 
    });
    
    const newFacebookLeadsToday = await FacebookLead.countDocuments({ 
      createdAt: { $gte: todayStart, $lte: todayEnd } 
    });

    // Calculate totals
    const totalLeads = totalIndiaMartLeads + totalFacebookLeads;
    const totalNewLeadsToday = newIndiaMartLeadsToday + newFacebookLeadsToday;

    res.status(200).json({
      success: true,
      data: {
        totalNewLeadsToday,
        totalLeads,
        totalIndiaMartLeads,
        totalFacebookLeads
      }
    });
  } catch (error) {
    console.error('Error fetching lead stats:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching lead statistics',
      error: error.message
    });
  }
};

// Dashboard API for get PieChart data
export const getPieChartData = async (req, res, next) => {
  try {
    // Accepted periods with weekly as default
    const validPeriods = ['weekly', 'monthly', 'yearly'];
    let { period = 'weekly' } = req.params;
    
    // Enforce valid periods only
    if (!validPeriods.includes(period)) {
      period = 'weekly'; // Default to weekly if invalid
    }

    // Date calculation (clean immutable approach)
    const now = new Date();
    let startDate = new Date(now); // Clone now date
    
    switch (period) {
      case 'monthly':
        startDate.setMonth(now.getMonth() - 1);
        break;
      case 'yearly':
        startDate.setFullYear(now.getFullYear() - 1);
        break;
      default: // weekly (including fallback for invalid values)
        startDate.setDate(now.getDate() - 7);
    }

    // Single query construction
    const leadQuery = { createdAt: { $gte: startDate } };
    
    // Parallel queries for better performance
    const [indiaMartLeads, facebookLeads] = await Promise.all([
      Leads.countDocuments(leadQuery),
      FacebookLead.countDocuments(leadQuery)
    ]);

    res.status(200).json({
      success: true,
      data: [
        { label: "India Mart", value: indiaMartLeads },
        { label: "Facebook", value: facebookLeads }
      ],
    });
    
  } catch (error) {
    console.error('Error fetching pie chart data:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching lead statistics',
      error: error.message
    });
  }
};

// Dashboard API for get PieChart data
// export const getChartData = async (req, res, next) => {
//   try {
//     // Accepted periods with weekly as default
//     const validPeriods = ['weekly', 'monthly', 'yearly'];
//     let { period = 'weekly' } = req.query;
    
//     // Enforce valid periods only
//     if (!validPeriods.includes(period)) {
//       period = 'weekly'; // Default to weekly if invalid
//     }

//     // Date calculation (clean immutable approach)
//     const now = new Date();
//     let startDate = new Date(now); // Clone now date
    
//     switch (period) {
//       case 'monthly':
//         startDate.setMonth(now.getMonth() - 1);
//         break;
//       case 'yearly':
//         startDate.setFullYear(now.getFullYear() - 1);
//         break;
//       default: // weekly (including fallback for invalid values)
//         startDate.setDate(now.getDate() - 7);
//     }

//     // Single query construction
//     const leadQuery = { createdAt: { $gte: startDate } };
    
//     // Parallel queries for better performance
//     const [indiaMartLeads, facebookLeads] = await Promise.all([
//       Leads.countDocuments(leadQuery),
//       FacebookLead.countDocuments(leadQuery)
//     ]);

//     res.status(200).json({
//       success: true,
//       data: [
//         { totalRequests: indiaMartLeads },
//         { completedRequests: facebookLeads }
//       ],
//     });
    
//   } catch (error) {
//     console.error('Error fetching pie chart data:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Error fetching lead statistics',
//       error: error.message
//     });
//   }
// };

export const getChartData = async (req, res, next) => {
  try {
    // Accepted periods with weekly as default
    const validPeriods = ['weekly', 'monthly', 'yearly'];
    let { period = 'weekly' } = req.query; // Changed from req.body to req.query since frontend uses params
    
    // Enforce valid periods only
    if (!validPeriods.includes(period)) {
      period = 'weekly'; // Default to weekly if invalid
    }

    // Date calculation (clean immutable approach)
    const now = new Date();
    let startDate = new Date(now); // Clone now date
    
    // Determine time intervals based on period
    let intervals = 7; // Default for weekly
    let timeUnit = 'day';
    
    switch (period) {
      case 'monthly':
        intervals = 30;
        startDate.setMonth(now.getMonth() - 1);
        break;
      case 'yearly':
        intervals = 12;
        timeUnit = 'month';
        startDate.setFullYear(now.getFullYear() - 1);
        break;
      default: // weekly (including fallback for invalid values)
        intervals = 7;
        startDate.setDate(now.getDate() - 7);
    }

    // Generate date labels
    const labels = [];
    const datePoints = [];
    
    for (let i = 0; i <= intervals; i++) {
      const date = new Date(startDate);
      
      if (timeUnit === 'day') {
        date.setDate(startDate.getDate() + i);
      } else if (timeUnit === 'month') {
        date.setMonth(startDate.getMonth() + i);
      }
      
      datePoints.push(new Date(date));
      
      if (timeUnit === 'day') {
        labels.push(date.toLocaleDateString('en-US', { weekday: 'short' }));
      } else {
        labels.push(date.toLocaleDateString('en-US', { month: 'short' }));
      }
    }

    // Function to aggregate data by time intervals
    const aggregateData = async (Model) => {
      const results = await Model.aggregate([
        {
          $match: {
            createdAt: { $gte: startDate, $lte: now }
          }
        },
        // {
        //   $group: {
        //     _id: {
        //       [timeUnit === 'day' ? '$dayOfYear' : '$month']: '$createdAt',
        //       ...(timeUnit === 'day' ? {} : { year: { '$year': '$createdAt' } })
        //     },
        //     count: { $sum: 1 },
        //     date: { $first: '$createdAt' }
        //   }
        // },
        {
          $group: {
            _id: timeUnit === 'day'
              ? {
                  dayOfYear: { $dayOfYear: "$createdAt" },
                  year: { $year: "$createdAt" }
                }
              : {
                  month: { $month: "$createdAt" },
                  year: { $year: "$createdAt" }
                },
            count: { $sum: 1 },
            date: { $first: "$createdAt" }
          }
        },
        {
          $sort: { date: 1 }
        }
      ]);

      // Map results to our date points
      const dataPoints = Array(intervals + 1).fill(0);
      
      results.forEach(result => {
        const resultDate = new Date(result.date);
        let index;
        
        if (timeUnit === 'day') {
          const diffDays = Math.floor((resultDate - startDate) / (1000 * 60 * 60 * 24));
          index = Math.min(diffDays, intervals);
        } else {
          const diffMonths = (resultDate.getFullYear() - startDate.getFullYear()) * 12 + 
                            (resultDate.getMonth() - startDate.getMonth());
          index = Math.min(diffMonths, intervals);
        }
        
        dataPoints[index] = result.count;
      });

      // Calculate cumulative sums for area chart
      for (let i = 1; i < dataPoints.length; i++) {
        dataPoints[i] += dataPoints[i - 1];
      }

      return dataPoints;
    };

    // Get data for both sources
    const [indiaMartData, facebookData] = await Promise.all([
      aggregateData(Leads),
      aggregateData(FacebookLead)
    ]);

    // Prepare response data
    const responseData = labels.map((label, index) => ({
      label,
      indiaTotalleads: indiaMartData[index] || 0,
      facebookTotalleads: facebookData[index] || 0,
      justDialtTotalleads: 0 // Uncomment if you want to include pending requests
    }));

    res.status(200).json({
      success: true,
      data: responseData
    });
    
  } catch (error) {
    console.error('Error fetching chart data:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching chart data',
      error: error.message
    });
  }
};

export const addFacebookLead = async (req, res) => {
  try {
    const body = req.body;
    console.log("body>>>>>>",body)  
    // ✅ Respond immediately to Facebook to avoid timeouts
    res.sendStatus(200);

    if (body.object === 'page') {
      for (const entry of body.entry) {
        for (const change of entry.changes) {
          if (change.field === 'leadgen') {
            const leadId = change.value.leadgen_id;
            console.log('leadId>>>>>>>>>>',leadId);
            try {
              const response = await axios.get(
                `https://graph.facebook.com/v23.0/${leadId}?access_token=${process.env.PAGE_ACCESS_TOKEN}`
              );
              
              const leadData = response.data;

              await FacebookLead.create({
                leadId: leadData.id,
                formId: leadData.form_id,
                createdTime: leadData.created_time,
                fieldData: leadData.field_data
              });

              console.log('✅ Lead saved:', leadData.id);
            } catch (err) {
              console.error('❌ Facebook API error:', err.response?.data || err.message);
            }
          }
        }
      }
    }
  } catch (err) {
    console.error('❌ Unexpected error:', err.message);
    res.sendStatus(500);
  }
};

// Facebook Webhook Verification
export const verifyWebhook = (req, res) => {
  const VERIFY_TOKEN = process.env.VERIFY_TOKEN;
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (mode && token && mode === 'subscribe' && token === VERIFY_TOKEN) {
    console.log('📩 Webhook verified');
    res.status(200).send(challenge);
  } else {
    res.sendStatus(403);
  }
};
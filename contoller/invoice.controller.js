import Leads from "../model/leadModel.js";
import FacebookLead from '../model/facebookModel.js';
import JustDialLead from '../model/justDialModel.js';
import HotLead from '../model/hotLeadModel.js';
import EFLLead from '../model/leadEFLModel.js';
import xml2js from 'xml2js'
import crypto from 'crypto';

import axios from "axios";
import WebEngageModel from "../model/webEngageSyncModel.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { generateExcel } from "../utils/getnerateExcel.js";
import { error } from "console";

export const addLeadIndiaMartController = async(req,res)=>{
    try {
      let leadData = req.body.RESPONSE;
      const source = "India Mart";
     if (leadData) {
      leadData = { ...leadData, Source: source };
      await WebEngageAPIFunction(leadData, source);
     }
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
        const { page = 1, limit = 10, search } = req.query;
        
        // Optional: Add filtering
        const filter = {};
        if (req.query.status) filter.status = req.query.status;
        if (req.query.source) filter.source = req.query.source;

         // ✅ Apply search only if provided
        if (search && search.trim() !== "") {
            // For partial match
            filter.UNIQUE_QUERY_ID = { $regex: search, $options: "i" };
        }
        
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
// Fetch the facebook leads
export const getFbLeadController = async (req, res, next) => {
    try {
        // Optional: Add pagination parameters
        const { page = 1, limit = 10, search } = req.query;
        
        // Optional: Add filtering
        const filter = {};
        if (req.query.status) filter.status = req.query.status;
        if (req.query.source) filter.source = req.query.source;

          // ✅ Apply search only if provided
        if (search && search.trim() !== "") {
            // For partial match
            filter.leadId = { $regex: search, $options: "i" };
        }
        
        const leads = await FacebookLead.find(filter)
            .limit(parseInt(limit))
            .skip((page - 1) * limit)
            .sort({ createdAt: -1 }); // Sort by newest first
        
        // Optional: Get total count for pagination info
        const total = await FacebookLead.countDocuments(filter);
        
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
    const totaljustDialLeads = await JustDialLead.countDocuments();
    
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
        totalFacebookLeads,
        totaljustDialLeads
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
    const [indiaMartLeads, facebookLeads, justdialLeads] = await Promise.all([
      Leads.countDocuments(leadQuery),
      FacebookLead.countDocuments(leadQuery),
      JustDialLead.countDocuments(leadQuery)
    ]);

    res.status(200).json({
      success: true,
      data: [
        { label: "India Mart", value: indiaMartLeads },
        { label: "Facebook", value: facebookLeads },
        { label: "JustDial", value: justdialLeads}
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
    const [indiaMartData, facebookData,justdialdata] = await Promise.all([
      aggregateData(Leads),
      aggregateData(FacebookLead),
      aggregateData(JustDialLead)
    ]);

    // Prepare response data
    const responseData = labels.map((label, index) => ({
      label,
      indiaTotalleads: indiaMartData[index] || 0,
      facebookTotalleads: facebookData[index] || 0,
      justDialtTotalleads: justdialdata[index] || 0,// Uncomment if you want to include pending requests
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

// Add facebook leads 
// export const addFacebookLead = async (req, res) => {
//   try {
//     const body = req.body;
//     console.log("body>>>>>>",body)  
//     // ✅ Respond immediately to Facebook to avoid timeouts
//     res.sendStatus(200);

//     if (body.object === 'page') {
//       for (const entry of body.entry) {
//         for (const change of entry.changes) {
//           if (change.field === 'leadgen') {
//             const leadId = change.value.leadgen_id;
//             console.log('leadId>>>>>>>>>>',leadId);
//             try {
//               const response = await axios.get(
//                 `https://graph.facebook.com/v23.0/${leadId}?access_token=${process.env.PAGE_ACCESS_TOKEN}`
//               );
              
//               const leadData = response.data;

//               await FacebookLead.create({
//                 leadId: leadData.id,
//                 formId: leadData.form_id,
//                 createdTime: leadData.created_time,
//                 fieldData: leadData.field_data
//               });

//               console.log('✅ Lead saved:', leadData.id);
//             } catch (err) {
//               console.error('❌ Facebook API error:', err.response?.data || err.message);
//             }
//           }
//         }
//       }
//     }
//   } catch (err) {
//     console.error('❌ Unexpected error:', err.message);
//     res.sendStatus(500);
//   }
// };

export const addFacebookLead = async (req, res) => {
  try {
    const body = req.body;
    // Respond immediately to Facebook to avoid webhook timeout
    res.sendStatus(200);

    if (body.object === "page") {
      for (const entry of body.entry) {
        for (const change of entry.changes) {
          if (change.field === "leadgen") {
            const leadId = change.value.leadgen_id;
            try {
              // Get lead detailed info (v23)
              const leadResponse = await axios.get(
                `https://graph.facebook.com/v23.0/${leadId}?access_token=${process.env.PAGE_ACCESS_TOKEN}`
              );
              const leadData = leadResponse.data;

              // Get ad/campaign info (v21)
              const formResponse = await axios.get(
                `https://graph.facebook.com/v21.0/${leadId}?fields=ad_name,adset_name,campaign_name,form_id,platform,created_time&access_token=${process.env.PAGE_ACCESS_TOKEN}`
              );
              const formData = formResponse.data;
              // Get form details to fetch form_name
              let formName = "";
              let formId = "";
              if (formData.form_id) {
                try {
                  const formDetails = await axios.get(
                    `https://graph.facebook.com/v23.0/${formData.form_id}?access_token=${process.env.PAGE_ACCESS_TOKEN}`
                  );
                  formName = formDetails?.data?.name;
                  formId = formDetails?.data?.id
                } catch (err) {
                  console.error("Error fetching form_name:", err.response?.data || err.message);
                }
              }

              // Combine data
              const combinedData = {
                leadId: leadData.id,
                formId,
                formName, 
                createdTime: leadData.created_time,
                fieldData: leadData.field_data,
                adName: formData.ad_name,
                adsetName: formData.adset_name,
                campaignName: formData.campaign_name,
                platform: formData.platform,
              };
              const source = "Facebook";
              const response = await WebEngageAPIFunction(combinedData,source)
              // Save to DB
              await FacebookLead.create(combinedData);

              console.log("Lead saved:", leadData.id);
            } catch (err) {
              console.error(
                "Facebook API error:",
                err.response?.data || err.message
              );
            }
          }
        }
      }
    }
  } catch (err) {
    console.error("Unexpected error:", err.message);
    res.sendStatus(500);
  }
};


// Add Just Dial leads
 export const addJustDialLead = async (req, res) => {
  try {
    let data = {};

    // If JSON POST
    if (req.is("application/json")) {
      data = req.body;
    }
    // If Form POST or GET query params
    else {
      data = req.method === "POST" ? req.body : req.query;
    }
    
    const source = "Just Dial"
    // Web engage API 
    const response = await WebEngageAPIFunction(data,source);

    // Save to DB
    const lead = new JustDialLead(data);
    await lead.save();

    return res.status(200).json({ success: true, message: "Lead stored successfully" });
  } catch (error) {
    // console.error("Webhook Error:", error);
    return res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

// Get Just Dial leads
export const getJustLeadController = async (req, res ) => {
    try {
        // Optional: Add pagination parameters
        const { page = 1, limit = 10, search } = req.query;
        
        // Optional: Add filtering
        const filter = {};
        if (req.query.status) filter.status = req.query.status;
        if (req.query.source) filter.source = req.query.source;

          // ✅ Apply search only if provided
        if (search && search.trim() !== "") {
            // For partial match
            filter.leadid = { $regex: search, $options: "i" };
        }
        
        const leads = await JustDialLead.find(filter)
            .limit(parseInt(limit))
            .skip((page - 1) * limit)
            .sort({ createdAt: -1 }); // Sort by newest first
        
        // Optional: Get total count for pagination info
        const total = await JustDialLead.countDocuments(filter);
        
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

// Add Hot Leads
export const addHotLead = async (req, res) =>{
  console.log("Hot lead webhook hit");
  try {
    let leadData = {};

    if (req.is('application/json')) {
      // If request is JSON
      leadData = req.body;
    } else if (req.is('text/xml') || req.is('application/xml') || req.is('text/plain')) {
      // If request is XML or plain text
      const parser = new xml2js.Parser({ explicitArray: false });
      const result = await parser.parseStringPromise(req.body);

      // Navigate to SOAP body or fallback
      leadData = result?.['soap:Envelope']?.['soap:Body']?.['efl'] || result?.efl;

      if (!leadData) {
        return res.status(400).json({ error: 'Invalid XML format' });
      }
    } else {
      return res.status(415).json({ error: 'Unsupported Content-Type' });
    }

    // Basic validation
    if (!leadData.name || !leadData.mobile) {
      return res.status(400).json({ error: 'Missing required fields: name or mobile' });
    }

    // Save to MongoDB
    const lead = new HotLead(leadData);
    await lead.save();

    return res.status(200).json({ message: 'Lead saved successfully', lead });
  } catch (err) {
    console.error('Error processing webhook:', err);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};

// Add EFL Leads
export const addEFLLead = async (req, res) =>{
  try {
    const data = req.body;

    // Basic validation
    if (!data.name || !data.phone) {
      return res.status(400).json({ error: 'Missing required fields: name or phone' });
    }

    // Optional: validate utm_params
    if (data.utm_params && typeof data.utm_params !== 'object') {
      return res.status(400).json({ error: 'Invalid utm_params format' });
    }

    // Save lead to MongoDB
    const lead = new EFLLead(data);
    await lead.save();

    return res.status(200).json({ message: 'Lead saved successfully', lead });
  } catch (err) {
    console.error('Error saving lead:', err);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}

// Get single fb lead
export const getSingleFbLead = async (req, res) => {
  try {
    const { leadId } = req.query; 

    if (!leadId) {
      return res.status(400).json({ success: false, message: "leadId is required" });
    }

    const lead = await FacebookLead.findOne({ leadId:leadId });

    if (!lead) {
      return res.status(404).json({ success: false, message: "No lead found" });
    }

    return res.status(200).json({ success: true, data: lead, message: "Lead fetched successfully" });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Export the Data
export const exportPendingRequestFormsToExcel = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 10000000,
    order = "desc",
    search,
    status
  } = req.query;
  let filter = {};
  if (search) {
    const reqMatch = search.match(/^REQ[-\s]?(\d+)$/i);
    if (reqMatch) {
      const slNoSearch = parseInt(reqMatch[1]);
      filter.$or = [{ slNo: slNoSearch }];
    } else {
      filter.$or = [
        { leadId: { $regex: search, $options: "i" } },
        { UNIQUE_QUERY_ID: { $regex: search, $options: "i" } }
      ];
    }
  }

  if (status) filter.status = { $regex: status, $options: "i" };

  const forms = await FacebookLead.find(filter)
            .limit(parseInt(limit))
            .skip((page - 1) * limit)
            .sort({createdAt:order});;
  const excelBuffer = await generateExcel(forms);
  res.setHeader(
    "Content-Type",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
  );
  res.setHeader("Content-Disposition", "attachment; filename=forms_data.xlsx");
  return res.send(excelBuffer);
});

// Get Webengage Logs 
export const getWebEngageLog = async(req,res)=>{
   try {
        // Optional: Add pagination parameters
        const { page = 1, limit = 10 } = req.query;
        
        // Optional: Add filtering
        const filter = {};
        if (req.query.status) filter.status = req.query.status;
        if (req.query.source) filter.source = req.query.source;

         // Apply search only if provided
        // if (search && search.trim() !== "") {
        //     // For partial match
        //     filter.UNIQUE_QUERY_ID = { $regex: search, $options: "i" };
        // }
        
        const leads = await WebEngageModel.find(filter)
            .limit(parseInt(limit))
            .skip((page - 1) * limit)
            .sort({ createdAt: -1 }); // Sort by newest first
        
        // Optional: Get total count for pagination info
        const total = await WebEngageModel.countDocuments(filter);
        
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


// Web Engage User and Event API 
const WebEngageAPIFunction = async (leadData, source) => {
  try {
    if (!leadData) return;

    // const sha1Id = generateSHA1(leadData.SENDER_MOBILE);
    const generatedPayload = generatePayload(leadData,source);
    // const userPayload = {
    //   userId: sha1Id,
    //   firstName: leadData?.SENDER_NAME,
    //   // lastName: '',
    //   email: leadData?.SENDER_EMAIL,
    //   hashedPhone: leadData.SENDER_MOBILE,
    //   whatsappOptIn: "TRUE",
    //   attributes: { Source: source }
    // };
     console.log('userPayload',generatedPayload.userPayload,'process.env.WEB_ENGAGE_URL_USER',process.env.WEB_ENGAGE_URL_USER);
    const userResponse = await axios.post(
      process.env.WEB_ENGAGE_URL_USER,
      generatedPayload?.userPayload,
      {
        headers: {
          'Authorization': `${process.env.WEB_ENGAGE_API_KEY}`, 
          'Content-Type': 'application/json'
        }
      }
    );
    // console.log('userResponse',userResponse);
    if (userResponse?.data?.response?.status === 'queued') {

      const eventPayload = {
        userId: generatedPayload.sha1Id,
        eventName: "STT_Direct_Sales_Lead",
        // eventTime: new Date().toISOString(),
        eventTime: getEventTimeWithTimezone(),
        eventData: leadData
      };
      console.log('eventPayload',eventPayload);
      const response = await axios.post(
        process.env.WEB_ENGAGE_URL_EVENT,
         eventPayload,
         {
          headers: {
            'Authorization': `${process.env.WEB_ENGAGE_API_KEY}`, 
            'Content-Type': 'application/json'
          }
        }
        );
      // console.log('response',response);
      if (response.status === 201) {
        const WebengagelogIndiaMart = {
          leadId: leadData?.UNIQUE_QUERY_ID ??
                  leadData?.leadId ??
                  leadData?.leadid ??
                  null,
          Date: new Date().toLocaleDateString(),
          Time: new Date().toLocaleTimeString(),
          Status: response?.data?.response?.status,
          type: source
        };
        await WebEngageModel.create(WebengagelogIndiaMart);
      }
    }
  } catch (err) {
    console.error("WebEngageUser error:", err);
  }
};

// Function to create SHA1 Id of user
function generateSHA1(mobileNumber) {
    // Remove country code if it starts with + and digits
  let normalizedNumber = mobileNumber.replace(/^\+\d{1,3}-?/, '');
  // Create SHA-1 hash
  const hash = crypto.createHash('sha1').update(normalizedNumber).digest('hex');
  return hash;
}

const getEventTimeWithTimezone = (date = new Date(), offset = '+0545') => {
  // Get YYYY-MM-DDTHH:mm:ss
  const pad = (num) => num.toString().padStart(2, '0');
  const year = date.getFullYear();
  const month = pad(date.getMonth() + 1);
  const day = pad(date.getDate());
  const hours = pad(date.getHours());
  const minutes = pad(date.getMinutes());
  const seconds = pad(date.getSeconds());
  
  return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}${offset}`;
};

// Function for generate payload for user
const generatePayload = (data,type)=>{
 if(type ==="India Mart"){
  const sha1Id = generateSHA1(data.SENDER_MOBILE);
  const userPayload = {
       userId: sha1Id,
      firstName: data?.SENDER_NAME,
      lastName: '',
      email: data?.SENDER_EMAIL,
      hashedPhone: data.SENDER_MOBILE,
      whatsappOptIn: "TRUE",
      attributes: { Source: type }
  }
  return { userPayload, sha1Id };

 } else if (type === "Just Dial") {
    const sha1Id = generateSHA1(data.mobile);
    const userPayload = {
       userId: sha1Id,
      firstName: data?.name,
      lastName: '',
      email: data?.email,
      hashedPhone: data.mobile,
      whatsappOptIn: "TRUE",
      attributes: { Source: type }
  }
  return { userPayload, sha1Id };

 } else {
    const getValue = (name) => {
      const field = data.fieldData.find((f) => f.name === name);
      return field?.values?.[0] || "";
      };
    // extract required fields
    const fullName = getValue("full_name");
    const [firstName, ...lastNameParts] = fullName.split(" ");
    const lastName = lastNameParts.join(" ") || "";
    const phone = getValue("phone_number");
    const email = getValue("email"); 
    const sha1Id = generateSHA1(phone);

    const userPayload = {
       userId: sha1Id,
      firstName,
      lastName,
      email:email,
      hashedPhone:phone,
      whatsappOptIn: "TRUE",
      attributes: { Source: type }
  }
  return { userPayload, sha1Id };
 }
}

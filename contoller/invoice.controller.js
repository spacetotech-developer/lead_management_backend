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

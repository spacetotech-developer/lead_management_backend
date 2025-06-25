import Leads from "../model/leadModel.js";

export const addLeadIndiaMartController = async(req,res,next)=>{
    try {
      const leadData = req.body.RESPONSE;
      const reponse = await Leads.create(leadData) 
      res.status(200).send("Lead saved");
  } catch (err) {
    // console.error("Webhook error:", err);
    res.status(500).send("Error saving lead");
  }
}


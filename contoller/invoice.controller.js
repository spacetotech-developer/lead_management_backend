import Invoice from "../model/leadModel.js";
import constant from "../constant.js";
import mongoose from "mongoose";

export const addLeadIndiaMartController = async(req,res,next)=>{
    try {
      const leadData = req.body;
      await leadData.save();
      res.status(200).send("Lead saved");
  } catch (err) {
    console.error("Webhook error:", err);
    res.status(500).send("Error saving lead");
  }
}


import mongoose from "mongoose";

const hotLeadSchema = new mongoose.Schema({
  name: { type: String, required: true },
  mobile: { type: String, required: true },
  email: String,
  address: String,
  pincode: String,
  state: String,
  city: String,
  media_type: String,
  utm_source: String,
  utm_medium: String,
  utm_campaign: String,
  date_of_month: String,
  time_of_day: String,
  day_of_week: String,
  month_of_year: String,
  user_id: String,
  uniqueid: String,
  originated_from: String,
  product_category: String,
  product_sku: String,
  device: String,
  utm_term: String,
  utm_content: String,
  utm_Sitelink: String,
  utm_location: String,
  utm_Adposition: String,
  utm_placement: String,
  utm_matchtype: String,
  utm_network: String,
}, { timestamps: true });

// module.exports = mongoose.model('hotLead', hotLeadSchema,'hotLeads');
const hotLead = mongoose.model("hotLead", hotLeadSchema, "hotLeads");

export default hotLead;

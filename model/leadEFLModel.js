import mongoose from "mongoose";

const EFLleadSchema = new mongoose.Schema({
  product_category: String,
  product_type: String,
  name: { type: String, required: true },
  phone: { type: String, required: true },
  pincode: String,
  city: String,
  state: String,
  tnc: Boolean,
  email: String,
  description: String,
  address_line1: String,
  company_name: String,
  lead_type: String,
  created_on: Number,
  modified_on: Number,
  utm_params: {
    utmTerm: String,
    utmMedium: String,
    utmSource: String,
    utmChannel: String,
    utmCampaign: String
  },
  contact: String
}, { timestamps: true });

const JustDialLead = mongoose.model('EFLLeads', EFLleadSchema, 'EFLLeads');
export default JustDialLead;


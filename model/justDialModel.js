import mongoose from "mongoose";
// Define Lead Schema
const leadSchema = new mongoose.Schema({
  leadid: { type: String, required: true, unique: true },
  leadtype: String,
  prefix: String,
  name: String,
  mobile: String,
  phone: String,
  email: String,
  date: Date,
  category: String,
  city: String,
  area: String,
  brancharea: String,
  dncmobile: Number,
  dncphone: Number,
  company: String,
  pincode: String,
  time: String,
  branchpin: String,
  parentid: String,
},{
  timestamps: { currentTime: () => Date.now() }
});

// Create Model
const JustDialLead = mongoose.model("JustDialLead", leadSchema,"JustDialLeads");

export default JustDialLead;
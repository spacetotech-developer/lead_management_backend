import mongoose from "mongoose";

const WebEngageSchema = new mongoose.Schema({
  leadId: String,
  Status: String,
  type: String
}, { timestamps: true });

const WebEngageModel = mongoose.model('WebEngage', WebEngageSchema, 'WebEngages');
export default WebEngageModel;


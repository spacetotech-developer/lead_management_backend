import mongoose from "mongoose";

// const facebookSchema = new mongoose.Schema({
//   Name: {
//     type: String,
//     required: false,
//   },
//   Email: {
//     type: String,
//     required: false
//   },
//   Phone: {
//     type: String,
//     required: false
//   },
//   FormId: {
//     type: String,
//     required: false
//   },
//   Address: {
//     type: String,
//     required: false,
//   },
//   leadContent: {
//     type: String,
//     required: false,
//   },
//   leadDescription: {
//     type: String,
//     required: false
//   } 
// }, {
//   timestamps: { currentTime: () => Date.now() },
//   toJSON: { virtuals: true },
//   toObject: { virtuals: true }
// });

const facebookSchema = new mongoose.Schema({
  leadId: String,
  formId: String,
  createdTime: Date,
  fieldData: [
    {
      name: String,
      values: [String]
    }
  ]
},{
  timestamps: { currentTime: () => Date.now() },
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
}
);

const facebook = mongoose.model("facebooklead", facebookSchema, "facebookLeads");

export default facebook;
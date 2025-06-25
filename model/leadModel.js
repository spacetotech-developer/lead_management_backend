import mongoose from "mongoose";

const leadSchema = new mongoose.Schema({
  UNIQUE_QUERY_ID: {
    type: String,
    required: true,
    unique: true
  },
  QUERY_TYPE: {
    type: String,
    enum: ['B', 'C'], // Assuming B is Business, C might be Consumer
    required: true
  },
  QUERY_TIME: {
    type: Date,
    required: true
  },
  SENDER_NAME: {
    type: String,
    required: true
  },
  SENDER_MOBILE: {
    type: String,
    required: true,
    validate: {
      validator: function(v) {
        return /^\+91-\d{10}$/.test(v);
      },
      message: props => `${props.value} is not a valid Indian mobile number!`
    }
  },
  SENDER_EMAIL: {
    type: String,
    required: true,
    lowercase: true,
    validate: {
      validator: function(v) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
      },
      message: props => `${props.value} is not a valid email!`
    }
  },
  SUBJECT: {
    type: String,
    required: true
  },
  SENDER_COMPANY: String,
  SENDER_ADDRESS: String,
  SENDER_CITY: String,
  SENDER_STATE: String,
  SENDER_PINCODE: String,
  SENDER_COUNTRY_ISO: {
    type: String,
    default: "IN"
  },
  SENDER_MOBILE_ALT: {
    type: String,
    validate: {
      validator: function(v) {
        return /^\+91-\d{10}$/.test(v);
      },
      message: props => `${props.value} is not a valid Indian mobile number!`
    }
  },
  SENDER_PHONE: String,
  SENDER_PHONE_ALT: String,
  SENDER_EMAIL_ALT: {
    type: String,
    lowercase: true,
    validate: {
      validator: function(v) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
      },
      message: props => `${props.value} is not a valid email!`
    }
  },
  QUERY_PRODUCT_NAME: {
    type: String,
    required: true
  },
  QUERY_MESSAGE: {
    type: String,
    required: true
  },
  QUERY_MCAT_NAME: String,
  CALL_DURATION: String,
  RECEIVER_MOBILE: String
}, {
  timestamps: { currentTime: () => Date.now() },
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Add indexes for better query performance
leadSchema.index({ UNIQUE_QUERY_ID: 1 });
leadSchema.index({ SENDER_EMAIL: 1 });
leadSchema.index({ SENDER_MOBILE: 1 });
leadSchema.index({ QUERY_PRODUCT_NAME: 1 });
leadSchema.index({ QUERY_TIME: 1 });

const Lead = mongoose.model("Lead", leadSchema, "leads");

export default Lead;
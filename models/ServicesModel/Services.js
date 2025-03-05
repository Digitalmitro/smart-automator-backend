const mongoose = require("mongoose");

const ServiceSchema = new mongoose.Schema({
  serviceName: {
    type: String,
    required: true,
    trim: true,
  },
  image: {
    type: String,
    required: true,
  },
  shortDescription: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  isFeatured: {
    type: Boolean,
    default: false,
  },
  questions: [
    {
      question: { type: String, required: true },
      options: { type: [String], required: true },
    },
  ],
  durationRanges: [
    {
      min: {
        type: Number,
        required: true,
      },
      max: {
        type: Number,
        required: true,
      },
    },
  ],
  vehicleRequired: {
    type: Boolean,
    default: false,
  },
  hourlyCharge: {
    type: String,
    required: true,
  },
  serviceCategory: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "ServiceCategories",
    required: true,
  },
  features:[{type:String}],
  projectTime:{type: String}
});

module.exports = mongoose.model("Service", ServiceSchema);

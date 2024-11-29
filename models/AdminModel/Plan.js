const mongoose = require("mongoose");

const PricingPlanSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    enum: ["Basic", "Advanced", "Premium"], // Restrict to known plans
  },
  description: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  duration: {
    type: String,
    enum: ["month"], // Can extend to support different durations
    default: "month",
  },
  features: [
    {
      type: String,
      required: true,
    },
  ],
  subscribeButtonText: {
    type: String,
    default: "Subscribe Today",
  },
  iconUrl: {
    type: String, // To store the icon/image URL
    required: true,
  },
});

const PricingPlan = mongoose.model("PricingPlan", PricingPlanSchema);
module.exports = PricingPlan;

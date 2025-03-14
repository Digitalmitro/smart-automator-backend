const mongoose = require("mongoose");

const testimonialSchema = mongoose.Schema(
  {
    title: String,
    description: String,
    active: {type: Boolean, default: true},
    image: String,
  },
  { timestamps: true }
);

const Testimonial = mongoose.model("testimonial", testimonialSchema);

module.exports = Testimonial;

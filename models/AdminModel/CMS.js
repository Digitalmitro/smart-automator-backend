const mongoose = require("mongoose");

const homepageSchema = mongoose.Schema({
  banner: {
    type: String,
    default: "",
  },
  heading: {
    type: String,
    default: "",
  },
  description: {
    type: String,
    default: "",
  },
  testimonials: [
    {
      type: mongoose.Types.ObjectId,
    },
  ],
  blogs: [
    {
      type: mongoose.Types.ObjectId,
      ref: 'Blog'
    },
  ],
});

const cmsSchema = mongoose.Schema({
  homePage: homepageSchema,
});

const CmsModel = mongoose.model("content_management", cmsSchema);

module.exports = CmsModel;

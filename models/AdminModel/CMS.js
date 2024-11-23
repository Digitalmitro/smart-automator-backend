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
});

const cmsSchema = mongoose.Schema({
  homePage: homepageSchema,
});

const CmsModel = mongoose.model(
  "content_management",
  cmsSchema
);

module.exports = CmsModel;

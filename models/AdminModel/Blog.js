const mongoose = require("mongoose");

const blogSchema = mongoose.Schema(
  {
    title: {
      type: String
    },
    shortDescription: {
      type: String
    },
    description: {
      type: String
    },
    slug: {
      type: String,
      unique: true,
    },
    active: { type: Boolean, default: false },
    images: [String],
  },
  { timestamps: true }
);

const BlogModel = mongoose.model("Blog", blogSchema);

module.exports = BlogModel;

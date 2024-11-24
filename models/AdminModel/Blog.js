const mongoose = require("mongoose");

const blogSchema = mongoose.Schema(
  {
    title: String,
    shortDescription: String,
    description: String,
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

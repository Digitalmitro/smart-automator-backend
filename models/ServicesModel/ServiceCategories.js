const mongoose = require("mongoose");

const serviceCategorySchema = mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  image: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  active: {
    type: Boolean,
    default: true,
  },
});

const ServiceCategory = mongoose.model(
  "ServiceCategories",
  serviceCategorySchema
);

module.exports = { ServiceCategory };

const mongoose = require("mongoose");

const registertaskerSchema = mongoose.Schema({
  firstName: {
    type: String,
    required: true,
  },
  lastName: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  phone: {
    type: Number,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  zip: {
    type: Number,
  },
  service: [{ type: mongoose.Schema.Types.ObjectId, ref: "service" }],
});

const RegistertaskerModal = mongoose.model(
  "register tasker",
  registertaskerSchema
);

module.exports = { RegistertaskerModal };

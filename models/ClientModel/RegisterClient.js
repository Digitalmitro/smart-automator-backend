const mongoose = require("mongoose");

const registerclientSchema = mongoose.Schema({
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
  order: [{ type: mongoose.Schema.Types.ObjectId, ref: "order" }],
  homeAddress: [{ type: mongoose.Schema.Types.ObjectId, ref: "homeAddress" }],
  workAddress: [{ type: mongoose.Schema.Types.ObjectId, ref: "workAddress" }],
});

const RegisterclientModal = mongoose.model(
  "register client",
  registerclientSchema
);

module.exports = { RegisterclientModal };

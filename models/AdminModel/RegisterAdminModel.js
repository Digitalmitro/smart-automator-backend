const mongoose = require("mongoose");

const registeradminSchema = mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },

});

const RegisteradminModal = mongoose.model(
  "register admin",
  registeradminSchema
);

module.exports = { RegisteradminModal };

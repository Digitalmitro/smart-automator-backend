const mongoose = require("mongoose");

const homeAddressSchema = mongoose.Schema({
  address1: {
    type: String,
    required: true,
  },
  address2: {
    type: String,
    
  },
  city: {
    type: String,
    required: true,
  },
  state: {
    type: String,
    required: true,
  },
  zip: {
    type: String,
  },
  addressType: {
    type: String,
    required: true,
  },
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "register client",
    required: true,
  },
});

const HomeAddressModal = mongoose.model("homeAddress", homeAddressSchema);

module.exports = { HomeAddressModal };

const mongoose = require("mongoose");

const addressSchema = mongoose.Schema({
  name:{
    type: String,
  },
  phone: {
    type: String,
  },
  country: {
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
  street: {
    type: String,
  },
  zip: {
    type: String,
  },
 
  addressType: {
    type: String,
    // required: true,
  },
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "register client",
    required: true,
  },
});

const AddressModal = mongoose.model("address", 
  addressSchema);

module.exports = { AddressModal };

const mongoose = require("mongoose");

const workAddressSchema = mongoose.Schema({
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

const WorkAddressModal = mongoose.model("workAddress", workAddressSchema);

module.exports = { WorkAddressModal };

const mongoose = require("mongoose");

const orderSchema = mongoose.Schema({
  image: {
    type: String,
  },
  phone: {
    type: String,
    required: true,
  },
  userName: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  vehicle: {
    type: String,
  },
  serviceCategory: {
    type: String,
    required: true,
  },
  location: {
    type: String,
  },
  orderTime: {
    type: String,
  },
  pricePerHour: {
    type: Number,
  },
  totaltask: {
    type: Number,
  },
  review: [
    {
      type: String,
    },
  ],
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "register client",
    required: true,
  },
});

const OrderModal = mongoose.model("order", orderSchema);

module.exports = { OrderModal };

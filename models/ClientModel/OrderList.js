const mongoose = require("mongoose");

const OrderSchema = new mongoose.Schema({
  serviceName: { type: String, required: true },
  serviceCategory: { type: String, required: true },
  contactDetails: { type: Number, required: true },
  taskLocation: { type: String, required: true },
  answersList: [
    {
      question: { type: String, required: true },
      answer: { type: String, required: true },
    },
  ],
  vehicles: { type: Boolean },
  taskDetails: { type: String, required: true },
  taskDate: { type: Date, required: true },
  taskTime: { type: String, required: true },
  timeDuration: { type: String, required: true },
  taskFrequency: { type: String },
  paymentMethod: { type: String, required: true },
  hourlyRate: { type: Number, required: true },
  paymentStatus: { type: String, enum: ["Pending", "Completed"], default: "Pending" },
  totalPrice: { type: Number, required: true },
  taskersId: { type: mongoose.Schema.Types.ObjectId, ref: "tasker" },
  addressId: { type: mongoose.Schema.Types.ObjectId, ref: "address", required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "user", required: true },
});

const OrderModel = mongoose.model("Order", OrderSchema);

module.exports = OrderModel;

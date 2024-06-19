const mongoose = require("mongoose");

// Define the schema for the Payment model
const paymentSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "User", // Reference to the User model
  },
  amount: {
    type: Number,
    required: true,
  },
  status: {
    type: String,
    enum: ["success", "failed"],
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

// Create the Payment model using the schema
const Payment = mongoose.model("Payment", paymentSchema);

module.exports = Payment;

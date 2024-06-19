const flash = require("express-flash");
const mongoose = require("mongoose");

//schema for storing return information
const returnSchema = new mongoose.Schema({
  orderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "MyOrder",
    required: true,
  },
  returnReason: {
    type: String,
    required: true,
  },
  additionalDetails: {
    type: String,
  },
  submittedAt: {
    type: Date,
    default: Date.now,
  },
  isReturn: {
    type: Boolean,
    default: false,
  },
  paymentOption: {
    type: String,
  },
  productName: {
    type: String,
    required: false,
  },
});

// Create model
const Return = mongoose.model("Return", returnSchema);

module.exports = Return;

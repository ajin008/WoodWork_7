const mongoose = require("mongoose");

const walletSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    unique: true,
  },
  balance: {
    type: Number,
    required: true,
    default: 0,
  },
  transactions: [
    {
      type: {
        type: String,
        enum: ["deposit", "withdrawal"],
        required: true,
      },
      amount: {
        type: Number,
        required: true,
      },
      description: {
        type: String,
      },
      timestamp: {
        type: Date,
        default: Date.now,
      },
      status: {
        type: String,
        enum: ["pending", "success", "failed"], 
        required: true,
      },
      orderId: {
        type: String,
      },
    },
  ],
});

const Wallet = mongoose.model("Wallet", walletSchema);

module.exports = Wallet;

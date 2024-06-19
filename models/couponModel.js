const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const couponSchema = new Schema({
  offerName: {
    type: String,
    required: true,
  },
  couponCode: {
    type: String,
    required: true,
    unique: true,
  },
  discountType: {
    type: String,
    enum: ["percentage", "fixed", "free-shipping"],
    required: true,
  },
  discountValue: {
    type: Number,
    required: true,
  },
  minPurchaseAmount: {
    type: Number,
  },
  validFrom: {
    type: Date,
    required: true,
  },
  validTo: {
    type: Date,
    required: true,
  },
  usageLimit: {
    type: Number,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
});

const Coupon = mongoose.model("Coupon", couponSchema);

module.exports = Coupon;
// const mongoose = require("mongoose");
// const Schema = mongoose.Schema;

// const usedCouponSchema = new Schema({
//   userId: {
//     type: String,
//     required: true,
//   },
//   couponId: {
//     type: String,
//     required: true,
//   },
//   productId: {
//     type: String,
//     required: true,
//   },
// });

// const UsedCoupon = mongoose.model("UsedCoupon", usedCouponSchema);

// module.exports = UsedCoupon;

const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const usedCouponSchema = new Schema({
  userId: {
    type: String,
    required: true,
  },
  couponId: {
    type: String,
    required: true,
  },
  productId: [
    {
      type: Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
  ],
});

const UsedCoupon = mongoose.model("UsedCoupon", usedCouponSchema);

module.exports = UsedCoupon;

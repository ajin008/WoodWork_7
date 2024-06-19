const mongoose = require("mongoose");

// Define schema
const myOrderSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    firstName: {
      type: String,
      required: true,
    },
    lastName: {
      type: String,
      required: true,
    },
    address: {
      type: String,
      required: true,
    },
    street: {
      type: String,
      required: true,
    },
    landmark: {
      type: String,
      required: true,
    },
    state: {
      type: String,
      required: true,
    },
    postalCode: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      required: true,
    },
    products: [
      {
        productId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
        },
        cancelled: {
          type: Boolean,
          default: false,
        },
        discountedPrice: {
          type: Number,
          required: true,
        },
        deliveryDateTime: {
          type: Date,
          required: false,
        },
        status: {
          type: String,
          enum: ["Processing", "Shipped", "Delivered", "Canceled"],
          default: "Processing",
        },
      },
    ],
    orderTotal: {
      type: Number,
      required: true,
    },
    oderType: {
      type: String,
      required: true,
    },
    rating: {
      type: Number,
      default: 0,
    },
    returnStatus: {
      type: String,
      enum: ["Pending", "Accepted", "Rejected"],
      default: "Pending",
    },
    discountValue: {
      type: Number,
      required: false,
    },
    discountType: {
      type: String,
      required: false,
    },
    payment: {
      type: String,
      default: "pending",
    },
    onlinePaymentStatus: {
      type: String,
      enum: ["pending", "success", "failed"],
      default: "pending",
    },
    couponId: {
      type: String,
      default: "no coupon applied",
    },
    deliveryCharge: {
      type: Number,
      required: true,
    },
  },
  { timestamps: true }
);

// Create model
const MyOrder = mongoose.model("MyOrder", myOrderSchema);

module.exports = MyOrder;

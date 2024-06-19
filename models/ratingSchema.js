const mongoose = require("mongoose");

const ratingSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true,
    index: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    refPath: "userRef",
    required: true,
    index: true,
  },
  userRef: {
    type: String,
    required: true,
    enum: ["userData", "GoogleUser"],
  },
  rating: {
    type: Number,
    min: 1,
    max: 5,
    required: true,
  },
});

const Rating = mongoose.model("Rating", ratingSchema);

module.exports = Rating;

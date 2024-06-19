const mongoose = require('mongoose');

// Define Wishlist Schema
const wishlistSchema = new mongoose.Schema({
  userId: {
    type: String, // Store user's ID as a string
    required: true
  },
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product', // Reference to Product model
    required: true
  },
  addedAt: {
    type: Date,
    default: Date.now
  }
});

// Create Wishlist model
const Wishlist = mongoose.model('Wishlist', wishlistSchema);

module.exports = Wishlist;

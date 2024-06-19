const mongoose = require('mongoose');

const cartSchema = new mongoose.Schema({
  // Reference to the regular user model
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'userData' },
  // Reference to the Google user model
  googleUser: { type: mongoose.Schema.Types.ObjectId, ref: 'GoogleUser' },
  items: [{
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    quantity: { type: Number, default: 1 }
  }]
});

const Cart = mongoose.model('Cart', cartSchema);

module.exports = Cart;

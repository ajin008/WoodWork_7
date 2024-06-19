const mongoose = require('mongoose');

// Define a schema for the product quantity
const productQuantitySchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product', // Assuming you have a Product model
    required: true
  },
  qty: {
    type: Number,
    required: true
  }
});

// Create a model for the product quantity schema
const ProductQuantity = mongoose.model('ProductQuantity', productQuantitySchema);

module.exports = ProductQuantity;

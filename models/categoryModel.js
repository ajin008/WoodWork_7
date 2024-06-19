const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true, // Ensure category names are unique
  },
  isListed: {
    type: Boolean,
    default: true, // Default value is false indicating the category is unblocked
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

categorySchema.pre("save", function (next) {
  this.lowercaseName = this.name.toLowerCase();
  next();
});

const Category = mongoose.model("Category", categorySchema);

module.exports = Category;

const mongoose = require("mongoose");

const googleUserSchema = new mongoose.Schema({
  googleId: {
    type: String,
    required: true,
    unique: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  FirstName: {
    type: String,
    required: true,
  },
  LastName: {
    type: String,
    required: true,
  },
  isBlocked: {
    type: Boolean,
    default: false,
  },
  phone: {
    type: String,
    required: false,
  },
});

const GoogleUser = mongoose.model("GoogleUser", googleUserSchema);

module.exports = GoogleUser;

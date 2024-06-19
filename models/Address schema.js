// const mongoose = require("mongoose");

// // Define a common address schema
// const addressSchema = new mongoose.Schema({
//   address: String,
//   street: String,
//   city: String,
//   state: String,
//   postalCode: String,
//   landmark: String,
//   houseNumber: String,
//   type: {
//     type: String,
//     default: "home", // Default type is home
//   },
// });

// // Address schema for UserData
// const userDataAddressSchema = new mongoose.Schema({
//   userId: {
//     type: mongoose.Schema.Types.ObjectId,
//     required: true,
//     ref: "UserData", // Reference to UserData model not it there should have chance of error
//   },
//   address: addressSchema, // Reference to the common address schema
// });

// // Address schema for GoogleUser
// const googleUserAddressSchema = new mongoose.Schema({
//   userId: {
//     type: mongoose.Schema.Types.ObjectId,
//     required: true,
//     ref: "GoogleUser", // Reference to GoogleUser model there should have chance of error
//   },
//   address: addressSchema, // Reference to the common address schema
// });

// // Create models for each address schema
// const UserDataAddress = mongoose.model(
//   "UserDataAddress",
//   userDataAddressSchema
// );
// const GoogleUserAddress = mongoose.model(
//   "GoogleUserAddress",
//   googleUserAddressSchema
// );

// module.exports = { UserDataAddress, GoogleUserAddress };

// const mongoose = require("mongoose");

// // Address schema for UserData
// const userDataAddressSchema = new mongoose.Schema({
//   userId: {
//     type: mongoose.Schema.Types.ObjectId,
//     required: true,
//     ref: "UserData", // Reference to UserData model
//   },
//   address: String,
//   street: String,
//   city: String,
//   state: String,
//   postalCode: String,
//   landmark: String,
//   houseNumber: String,
//   type: {
//     type: String,
//     default: "home", // Default type is home
//   },
// });

// // Address schema for GoogleUser
// const googleUserAddressSchema = new mongoose.Schema({
//   userId: {
//     type: mongoose.Schema.Types.ObjectId,
//     required: true,
//     ref: "GoogleUser", // Reference to GoogleUser model
//   },
//   address: String,
//   street: String,
//   city: String,
//   state: String,
//   postalCode: String,
//   landmark: String,
//   houseNumber: String,
//   type: {
//     type: String,
//     default: "home", // Default type is home
//   },
// });

// // Create models for each address schema
// const UserDataAddress = mongoose.model("UserDataAddress", userDataAddressSchema);
// const GoogleUserAddress = mongoose.model("GoogleUserAddress", googleUserAddressSchema);

// module.exports = { UserDataAddress, GoogleUserAddress };
const mongoose = require("mongoose");

// Address schema for UserData
const userDataAddressSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "UserData", // Reference to UserData model
  },
  address: String,
  street: String,
  city: String,
  state: String,
  postalCode: String,
  landmark: String,
  houseNumber: String,
  type: {
    type: String,
    default: "home", // Default type is home
  },
});

// Address schema for GoogleUser
const googleUserAddressSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "GoogleUser", // Reference to GoogleUser model
  },
  address: String,
  street: String,
  city: String,
  state: String,
  postalCode: String,
  landmark: String,
  houseNumber: String,
  type: {
    type: String,
    default: "home", // Default type is home
  },
});

// Create models for each address schema
const UserDataAddress = mongoose.model(
  "UserDataAddress",
  userDataAddressSchema
);
const GoogleUserAddress = mongoose.model(
  "GoogleUserAddress",
  googleUserAddressSchema
);

module.exports = { UserDataAddress, GoogleUserAddress };

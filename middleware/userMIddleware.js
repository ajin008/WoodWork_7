const Cart = require("../models/cartSchema");
const Wishlist = require("../models/wishListSchema");

exports.checkCartNotEmpty = async (req, res, next) => {
  try {
    // Retrieve the user's ID
    const userId = req.session.user._id;

    // Find the user's cart
    const cart = await Cart.findOne({ user: userId });

    // Check if the cart exists and if it contains any items
    if (!cart || cart.items.length === 0) {
      // If the cart is empty, redirect the user to the cart page
      return res.redirect("/home");
    }

    // If the cart is not empty, proceed to the next middleware or route handler
    next();
  } catch (error) {
    console.error("Error checking cart:", error);
    res.status(500).send("Internal Server Error");
  }
};

exports.checkEmptyWishlist = async (req, res, next) => {
  try {
    console.log("checkEmptyWishlist is triggering");
    // Retrieve the user's ID
    const userId = req.session.user._id;

    // Find the user's wishlist
    const wishlist = await Wishlist.find({ userId: userId });
    console.log("wishlist", wishlist);

    // Check if the wishlist exists and if it contains any items
    if (!wishlist || wishlist.length === 0) {
      return res.render("checkEmptyWishlist");
    }

    // If the wishlist is not empty, proceed to the next middleware or route handler
    next();
  } catch (error) {
    console.error("Error checking wishlist:", error);
    res.status(500).send("Internal Server Error");
  }
};

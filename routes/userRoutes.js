const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const { requireLogin } = require("../middleware/authmiddleware");
const { requireAuth } = require("../middleware/authmiddleware");
const { preventAuthenticatedAccess } = require("../middleware/authmiddleware");
const {
  preventGoogleAuthenticatedAccess,
} = require("../middleware/authmiddleware");
const { checkSession } = require("../middleware/authmiddleware");
const passport = require("passport"); // Import Passport.js
const userProduct = require("../controllers/userProduct");
const { checkUserStatus } = require("../middleware/authmiddleware");
const { checkCartNotEmpty } = require("../middleware/userMIddleware");
const Product = require("../models/productModel");
const { checkEmptyWishlist } = require("../middleware/userMIddleware");

//landing page
router.get(
  "/landingPage",
  preventAuthenticatedAccess,
  preventGoogleAuthenticatedAccess,
  (req, res, next) => {
    try {
      res.header("Cache-Control", "no-cache, no-store, must-revalidate");
      res.header("Pragma", "no-cache");
      res.header("Expires", "0");
      res.render("landingPage.ejs");
    } catch (error) {
      console.log(error);
      next(error);
    }
  }
);

//login
router.get(
  "/login",
  preventAuthenticatedAccess,
  preventGoogleAuthenticatedAccess,
  (req, res, next) => {
    try {
      res.render("login.ejs");
    } catch (error) {
      console.log(error);
      next(error);
    }
  }
);
router.post("/login", authController.login);

//signup
router.get(
  "/signup",
  preventAuthenticatedAccess,
  preventGoogleAuthenticatedAccess,
  (req, res, next) => {
    try {
      res.render("signup.ejs");
    } catch (error) {
      console.log(error);
      next(error);
    }
  }
);

router.post(
  "/signup",
  preventAuthenticatedAccess,
  preventGoogleAuthenticatedAccess,
  authController.signup
);

router.post(
  "/signupOtpUser",
  preventAuthenticatedAccess,
  preventGoogleAuthenticatedAccess,
  authController.signupVerify_otp
);

router.post(
  "/signupResendOtp",
  preventAuthenticatedAccess,
  preventGoogleAuthenticatedAccess,
  authController.resendOtp
);

// Route for initiating Google OAuth authentication
router.get(
  "/auth/google",
  (req, res, next) => {
    if (req.path === "/signup") {
      req.session.signup = true;
    }
    next();
  },
  passport.authenticate("google", {
    scope: ["profile", "email"],
  })
);

// Route for handling Google OAuth callback
router.get(
  "/auth/google/callback",
  passport.authenticate("google", {
    failureRedirect: "/login", // Redirect to login page if authentication fails
  }),
  (req, res) => {
    try {
      // Access user details from the authenticated user object provided by Passport
      const { email, googleId, _id } = req.user;
      console.log("/auth/google/callback", _id);
      // Redirect the user to the home page
      // Store the user's email and Google ID in the session
      req.session.email = email;
      req.session.googleId = googleId;
      req.session.user = { _id };

      res.redirect("/home");
    } catch (error) {
      console.error("Error processing Google OAuth callback:", error);
      res.redirect("/login"); // Redirect to login page in case of error
    }
  }
);

// Home
router.get(
  "/home",
  requireAuth,
  requireLogin,
  checkUserStatus,
  async (req, res, next) => {
    try {
      console.log("home is triggering");
      const userId = req.session.user._id;
      console.log("the user id is :", userId);
      if (userId) {
        console.log("User ID is here:", userId);
      } else {
        console.error("User ID not found in session");
      }
      const products = await Product.find().limit(3);
      res.header("Cache-Control", "no-cache, no-store, must-revalidate");
      res.header("Pragma", "no-cache");
      res.header("Expires", "0");

      res.render("home.ejs", { userId, products });
    } catch (error) {
      console.log(error);
      next(error);
    }
  }
);

//rendering shop page
router.get(
  "/shop",
  requireAuth,
  requireLogin,
  checkUserStatus,
  userProduct.productList
);
// router.post("/shop", userProduct.productDetails);

//cart
router.get("/cart", requireAuth, requireLogin, checkUserStatus, (req, res) => {
  res.render("cart");
});

//forgetPassword
router.get(
  "/forgetPassword",
  checkUserStatus,
  preventAuthenticatedAccess,
  (req, res) => {
    res.render("forgetPassword");
  }
);
router.post("/forgotPassword", authController.forgotPassword);

//otp
router.get("/otp", checkUserStatus, preventAuthenticatedAccess, (req, res) => {
  const currentTime = Date.now();
  const timestamp = req.session.timestamp || currentTime;
  const timeElapsed = (currentTime - timestamp) / 1000; // Calculate time elapsed in seconds
  const timerDuration = 5 * 60; // 5 minutes
  const remainingTime = Math.max(timerDuration - timeElapsed, 0);

  // Store the remaining time in the session
  req.session.remainingTime = remainingTime;

  res.render("otp", { remainingTime });
});

router.post("/otp", authController.otpVerification);

//resendOtp
router.get(
  "/resendOTP",
  checkUserStatus,
  preventAuthenticatedAccess,
  authController.showResendForm
);
router.post("/resendOtp", (req, res) => {
  const email = req.session.signupData.email;
  authController.resendOtp(req, res, email);
});

//newPassword
router.get(
  "/newPassword",
  checkUserStatus,
  preventAuthenticatedAccess,
  (req, res) => {
    const passwordUpdated = req.session.passwordUpdated || false;
    req.session.passwordUpdated = undefined;
    res.render("newPassword", { passwordUpdated });
  }
);

router.post("/newPassword", (req, res) => {
  authController.newPassword(req, res);
});

//aboutUS
router.get("/about", requireAuth, requireLogin, checkUserStatus, (req, res) => {
  const userId = req.session.user._id;
  res.render("about", { userId });
});

//services
router.get(
  "/services",
  requireAuth,
  requireLogin,
  checkUserStatus,
  (req, res) => {
    const userId = req.session.user._id;
    res.render("services", { userId });
  }
);

//blog
router.get("/blog", requireAuth, requireLogin, checkUserStatus, (req, res) => {
  const userId = req.session.user._id;
  res.render("blog", { userId });
});

//contact
router.get(
  "/contact",
  requireAuth,
  requireLogin,
  checkUserStatus,
  (req, res) => {
    const userId = req.session.user._id;
    res.render("contact", { userId });
  }
);

router.get(
  "/thankyou",
  requireAuth,
  requireLogin,
  checkUserStatus,
  (req, res) => {
    res.render("thankyou");
  }
);

// GET route to display product details
router.get(
  "/product/:productId",
  requireAuth,
  requireLogin,
  checkUserStatus,
  userProduct.getProductDetails
);

router.get(
  "/product/:productId/stock",
  requireAuth,
  requireLogin,
  checkUserStatus,
  userProduct.showRemainingStock
);

router.get(
  "/userWishlist/:userId",
  requireAuth,
  requireLogin,
  checkUserStatus,
  checkEmptyWishlist,
  userProduct.userWishlistRendering
);
router.post("/addToWishlist", userProduct.addingToWishList);

router.get(
  "/user-details/:userId",
  requireAuth,
  requireLogin,
  checkSession,
  checkUserStatus,
  userProduct.renderUserProfile
);

router.get("/reset-password", userProduct.resetPassword);

router.get(
  "/addAddress/:userId",
  requireAuth,
  requireLogin,
  checkSession,
  checkUserStatus,
  userProduct.renderAddAddress
);

router.get(
  "/addAddress_1/:userId/:checkout",
  requireAuth,
  requireLogin,
  checkSession,
  checkUserStatus,
  userProduct.renderAddAddress_1
);

router.post("/add-address/:userId", userProduct.addAddress);

router.post("/add-address_1/:userId", userProduct.addAddress_1);

router.get(
  "/addressEdit/:addressId",
  requireAuth,
  requireLogin,
  checkSession,
  checkUserStatus,
  userProduct.addressEdit
);

router.post("/updateAddress/:addressId", userProduct.updateAddress);

router.get(
  "/EditProfile/:userId",
  requireAuth,
  requireLogin,
  checkSession,
  checkUserStatus,
  userProduct.editUserProfile
);

router.post("/updateProfile/:userId", userProduct.updateProfile);

router.post("/addressRemove/:addressId", userProduct.addressRemove);

router.get(
  "/user-cart/:userId",
  requireAuth,
  requireLogin,
  checkSession,
  checkUserStatus,
  userProduct.userCart
); //for rendering cart

router.post("/addToCart", userProduct.addToCart);

router.get(
  "/emptyCartPage",
  requireAuth,
  requireLogin,
  checkSession,
  checkUserStatus,
  userProduct.renderEmptyCartPage
);

router.get(
  "/wallet/:userId",
  requireAuth,
  requireLogin,
  checkSession,
  checkUserStatus,
  userProduct.renderWallet
);

router.post("/update-total-price", userProduct.updateTotalPrice);

router.post("/remove-product", userProduct.removeProduct);

router.post("/update-cartQty", userProduct.updateCartQty);

router.get(
  "/checkout",
  requireAuth,
  requireLogin,
  checkSession,
  checkUserStatus,
  checkCartNotEmpty,
  userProduct.checkoutCart
);

router.get("/checkout_1", userProduct.checkout_1);

router.post("/buy", userProduct.checkoutProduct);

router.post("/updateOrder", checkOderType_1, userProduct.orderPlacement_1);

//middleware to check oderType selected
function checkOderType_1(req, res, next) {
  if (!req.body.oderType) {
    req.flash("error", "Please select a payment method.");
    return res.redirect("/shop");
  }
  next();
}

//middleware to check oderType selected
function checkOderType(req, res, next) {
  if (!req.body.oderType) {
    req.flash("error", "Please select a payment method.");
    return res.redirect("/checkout");
  }
  next();
}

router.post("/placeOrder", checkOderType, userProduct.placeOrder);

router.post("/createRazorpayOrder", userProduct.createRazorpayOrder);

router.post("/verifyRazorpayPayment", userProduct.verifyRazorpayPayment);

router.get(
  "/updateOrderPaymentStatus/:orderId/:status",
  userProduct.updateOrderPaymentStatus
);

router.get(
  "/MyOder_detailsRendering/:userId",
  requireAuth,
  requireLogin,
  checkSession,
  checkUserStatus,
  userProduct.RenderingOder_detail
);
router.get(
  "/order/details/:orderId",
  requireAuth,
  requireLogin,
  checkSession,
  checkUserStatus,
  userProduct.RenderingViewOrder
);

router.post("/orders/rating", userProduct.ratingProduct);

router.get(
  "/deliverd_detailsRendering/:userId",
  requireAuth,
  requireLogin,
  checkSession,
  checkUserStatus,
  userProduct.RenderingDeliveredOder_detail
);

router.post(
  "/Remove_OrderProduct/:orderId/:productId",
  userProduct.Remove_OrderProduct
);

router.post("/submit-rating", userProduct.ProductRating);

router.post("/submitReturn", userProduct.submitReturnFunction);

router.post("/cancelReturn", userProduct.cancelReturnFunction);

router.post("/removeFromWishlist", userProduct.removeProductFromWishlist);

router.post("/addToCartFromWishlist", userProduct.addToCartFromWishlist);

router.post("/applyCoupon", userProduct.applyCoupon);

router.post("/applyCoupon_1", userProduct.applyCoupon_1);

router.post("/addMoney", userProduct.addMoney);

router.get(
  "/viewOrder_1/:orderId/:productId",
  requireAuth,
  requireLogin,
  checkSession,
  checkUserStatus,
  userProduct.viewOrder_1
);

router.get("/download-invoice/:orderId", userProduct.downloadInvoice);

router.post("/create-paymentWallet", userProduct.razorPayPaymentWallet);

router.post("/verify-payment", userProduct.verifyPayment);

router.post("/viewTransaction", userProduct.viewTransaction);

//logout
router.post("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error("Error destroying session:", err);
    }
    res.clearCookie("connect.sid");
    res.redirect("/landingPage");
  });
});

module.exports = router;

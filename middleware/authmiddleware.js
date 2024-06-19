const UserData = require("../models/userModel");
const GoogleUser = require("../models/googleUserModel");

// Middleware to check if user is logged in
exports.requireLogin = (req, res, next) => {
  if (!req.session.user && !req.session.passport) {
    // Check if both user and passport sessions are not set
    req.flash("error", "Please login to access this page");
    return res.redirect("/login");
  }
  next();
};

// Middleware to check if user is authenticated
exports.requireAuth = (req, res, next) => {
  if (!req.session.user && !req.session.passport) {
    // Check if both user and passport sessions are not set
    return res.redirect("/login");
  } else if (req.session.user && req.session.user.googleId) {
    // If the user is authenticated with Google, redirect to the home page
    return res.redirect("/home");
  }
  next();
};


// Middleware to prevent access to authenticated users
exports.preventAuthenticatedAccess = (req, res, next) => {
  if (req.session.user || req.session.passport) {
    // Check if either user or passport session is set
    return res.redirect("/home");
  }
  next();
};

// Middleware to prevent access to Google authenticated users on signup or login routes
exports.preventGoogleAuthenticatedAccess = (req, res, next) => {
  if (req.session.user && req.session.user.googleId) {
    // If the user is authenticated with Google, redirect to the home page
    return res.redirect("/home");
  }
  next();
};

// Middleware to prevent access to Google authenticated users on signup or login routes
exports.checkUserStatus = async (req, res, next) => {
  try {
    // Check if the user is logged in and their session exists
    if (req.session && req.session.user) {
      const userId = req.session.user._id;

      // Check if the user is blocked in the UserData collection
      const userData = await UserData.findById(userId);
      if (userData && userData.isBlocked) {
        // If blocked, destroy the session
        req.session.destroy((err) => {
          if (err) {
            console.error("Error destroying session:", err);
          }
          // Redirect the user to the landing page or login page
          res.redirect("/login"); // Adjust the redirect URL as needed
        });
        return; // Exit the middleware
      }
    }

    // Check if the user is a Google user and if so, check if they're blocked
    if (req.session && req.session.googleId) {
      // Assuming Passport sets req.user after authentication
      const googleId = req.session.googleId;

      // Check if the Google user is blocked
      const googleUser = await GoogleUser.findOne({ googleId: googleId });
      if (googleUser && googleUser.isBlocked) {
        // If blocked, destroy the session
        req.session.destroy((err) => {
          if (err) {
            console.error("Error destroying session:", err);
          }
          // Redirect the user to the landing page or login page
          res.redirect("/login"); // Adjust the redirect URL as needed
        });
        return; // Exit the middleware
      }
    }

    // If the user is not blocked, proceed to the next middleware or route handler
    next();
  } catch (error) {
    console.error("Error checking user status:", error);
    // Handle errors and redirect the user to an error page or login page
    res.redirect("/login"); // Adjust the redirect URL as needed
  }
};


exports.checkSession = (req, res, next) => {
  if (!req.session) {
    // If session is destroyed, redirect to login page or any other desired page
    return res.redirect('/forgetPassword');
  }
  next();
};



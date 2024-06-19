exports.adminLogin = async (req, res) => {
  const { userName, password } = req.body;
  try {
    if (userName === "admin" && password === "123") {
      req.session.isAdminAuthenticated = true;
      console.log(req.session);
      res.redirect("/adminDash");
    } else if (userName !== "admin") {
      req.flash("error", "Invalid username");
      res.redirect("/adminLogin"); // Redirect back to the login page
    } else if (password !== "123") {
      req.flash("error", "Invalid password");
      res.redirect("/adminLogin"); // Redirect back to the login page
    } else {
      req.flash("error", "Please enter your username and password");
      res.redirect("/adminLogin"); // Redirect back to the login page
    }
  } catch (err) {
    console.error("Error occurred during login:", err);
    req.flash("error", "An error occurred during login");
    res.redirect("/adminLogin"); // Redirect back to the login page
  }
};

exports.userManagement = async (req, res) => {
  res.redirect("userManagement");
};

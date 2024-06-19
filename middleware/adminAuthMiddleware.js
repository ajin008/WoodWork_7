const preventBackButtonBeforeLogout = (req, res, next) => {
  if (req.session.isAdminAuthenticated && req.path === "/adminLogin") {
    return res.redirect("/adminDash");
  }
  next();
};

module.exports = preventBackButtonBeforeLogout;

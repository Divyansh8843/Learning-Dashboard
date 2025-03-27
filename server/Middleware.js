const User=require("./models/User")
module.exports.isLoggedIn = (req, res, next) => {
    if (!req.isAuthenticated()) {
      res.status(400).json({message:"User does not logged in"})
      return res.redirect("/api/auth/login");
    }
    next();
};

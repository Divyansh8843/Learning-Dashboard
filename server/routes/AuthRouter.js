const express=require("express")
const router=express.Router({mergeParams:true})
const authController=require("../controllers/authController")
const {isLoggedIn}=require("../Middleware")
const passport=require("passport")
const WrapAsync=require("../utils/WrapAsync")
router.route("/login").post(WrapAsync(authController.login))
router.route("/register").post(WrapAsync(authController.register))
router.route("/logout").post(isLoggedIn,WrapAsync(authController.logout))
router.get('/google',
passport.authenticate('google', { scope: ['profile','email'] }));
router.get('/google/callback', 
passport.authenticate('google', { failureRedirect: '/login', successRedirect: "/dashboard" })
)
module.exports=router;

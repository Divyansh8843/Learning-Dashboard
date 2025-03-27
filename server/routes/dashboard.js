const express=require("express")
const router=express.Router({mergeParams:true})
const dashboardController=require("../controllers/dashboardController")

router.route("/chatbot").post(dashboardController.chatbot)
router.route("/recommend").post(dashboardController.recommend)
router.route("/analyze").post(dashboardController.analyze)

module.exports=router

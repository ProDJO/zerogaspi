const express = require("express");
const router  = express.Router();
const authMiddleware    = require("../middleware/authMiddleware");
const ratingController  = require("../controllers/ratingController");

router.post("/",              authMiddleware, ratingController.submitRating);
router.get("/mine",           authMiddleware, ratingController.getMyRatings);
router.get("/product/:id",                   ratingController.getProductRatings);

module.exports = router;

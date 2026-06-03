const express = require("express");
const router  = express.Router();
const auth    = require("../middleware/authMiddleware");
const admin   = require("../middleware/adminMiddleware");
const ctrl    = require("../controllers/adminController");

// Stats
router.get("/stats", auth, admin, ctrl.getStats);

// Categories
router.get("/categories",      ctrl.listCategories);                  // public (used by product forms)
router.post("/categories",     auth, admin, ctrl.createCategory);
router.delete("/categories/:id", auth, admin, ctrl.deleteCategory);

// Coupons
router.get("/coupons",         auth, admin, ctrl.listCoupons);
router.post("/coupons",        auth, admin, ctrl.createCoupon);
router.delete("/coupons/:id",  auth, admin, ctrl.deleteCoupon);
router.post("/coupons/validate", auth, ctrl.validateCoupon);         // clients use this

// CSV exports
router.get("/export/users",      auth, admin, ctrl.exportUsers);
router.get("/export/orders",     auth, admin, ctrl.exportOrders);
router.get("/export/deliveries", auth, admin, ctrl.exportDeliveries);

module.exports = router;

const express = require("express");
const router = express.Router();
const controller = require("../controllers/orderController");
const { protect, adminOnly } = require("../middleware/auth");

router.use(protect);

router.get("/cart", controller.getCart);
router.post("/cart", controller.addToCart);
router.put("/cart/:productId", controller.updateCartItem);
router.delete("/cart/:productId", controller.removeFromCart);
router.delete("/cart", controller.clearCart);

router.post("/checkout", controller.checkout);
router.get("/orders", controller.getMyOrders);
router.get("/orders/:id", controller.getOrder);

// Admin
router.get("/admin/orders", adminOnly, controller.getAllOrders);
router.put("/admin/orders/:id", adminOnly, controller.updateOrderStatus);
router.get("/admin/stats", adminOnly, controller.getAdminStats);

module.exports = router;

const express = require("express");
const router = express.Router();
const controller = require("../controllers/productController");
const { protect, adminOnly } = require("../middleware/auth");

router.get("/", controller.getProducts);
router.get("/categories", controller.getCategories);
router.get("/:id", controller.getProduct);
router.post("/", protect, adminOnly, controller.createProduct);
router.put("/:id", protect, adminOnly, controller.updateProduct);
router.delete("/:id", protect, adminOnly, controller.deleteProduct);

module.exports = router;

const express = require("express");
const router = express.Router();
const controller = require("../controllers/transactionController");
const { protect } = require("../middleware/auth");

router.use(protect);

router.get("/", controller.getTransactions);
router.get("/summary", controller.getSummary);
router.post("/", controller.createTransaction);
router.put("/:id", controller.updateTransaction);
router.delete("/:id", controller.deleteTransaction);

module.exports = router;

const express = require("express");
const router = express.Router();
const controller = require("../controllers/studentController");

router.get("/", controller.getAllStudents);
router.get("/stats", controller.getStats);
router.get("/:id", controller.getStudent);
router.post("/", controller.createStudent);
router.put("/:id", controller.updateStudent);
router.delete("/:id", controller.deleteStudent);

module.exports = router;

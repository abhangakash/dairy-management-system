const express = require("express");
const router  = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const {
  getWorkerOptions,
  createAttendance,
  getAttendance,
  deleteAttendance,
} = require("../controllers/attendanceController");

router.get("/options/workers", authMiddleware, getWorkerOptions);
router.post("/",               authMiddleware, createAttendance);
router.get("/",                authMiddleware, getAttendance);
router.delete("/:id",          authMiddleware, deleteAttendance);

module.exports = router;

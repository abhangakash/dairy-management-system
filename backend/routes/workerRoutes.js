const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const {
  createWorker,
  getWorkers,
  updateWorker,
  deleteWorker,
  toggleStatus,
} = require("../controllers/workerController");

router.post("/", authMiddleware, createWorker);
router.get("/", authMiddleware, getWorkers);
router.put("/:id", authMiddleware, updateWorker);
router.delete("/:id", authMiddleware, deleteWorker);
router.patch("/status/:id", authMiddleware, toggleStatus);

module.exports = router;
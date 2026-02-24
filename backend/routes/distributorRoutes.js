const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const {
  createDistributor,
  getDistributors,
  updateDistributor,
  deleteDistributor,
  toggleStatus,
} = require("../controllers/distributorController");

router.post("/", authMiddleware, createDistributor);
router.get("/", authMiddleware, getDistributors);
router.put("/:id", authMiddleware, updateDistributor);
router.delete("/:id", authMiddleware, deleteDistributor);
router.patch("/status/:id", authMiddleware, toggleStatus);

module.exports = router;
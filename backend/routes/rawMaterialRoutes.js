const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const {
  createRawMaterial,
  getRawMaterials,
  getSingleRawMaterial,
  updateRawMaterial,
  deleteRawMaterial,
  toggleStatus,
} = require("../controllers/rawMaterialController");

router.post("/", authMiddleware, createRawMaterial);
router.get("/", authMiddleware, getRawMaterials);

// IMPORTANT: specific routes like /status/:id must come BEFORE /:id
router.patch("/status/:id", authMiddleware, toggleStatus);

router.get("/:id", authMiddleware, getSingleRawMaterial);
router.put("/:id", authMiddleware, updateRawMaterial);
router.delete("/:id", authMiddleware, deleteRawMaterial);

module.exports = router;
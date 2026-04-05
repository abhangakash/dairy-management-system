const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const {
  getDistributorOptions,
  getProductOptions,
  createSell,
  getSells,
  deleteSell,
} = require("../controllers/sellController");

// Dropdown options
router.get("/options/distributors", authMiddleware, getDistributorOptions);
router.get("/options/products", authMiddleware, getProductOptions);

// CRUD
router.post("/", authMiddleware, createSell);
router.get("/", authMiddleware, getSells);
router.delete("/:id", authMiddleware, deleteSell);

module.exports = router;
const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const {
  getProductOptions,
  createProduction,
  getProductions,
  deleteProduction,
} = require("../controllers/productionController");

// Dropdown options
router.get("/options/products", authMiddleware, getProductOptions);

// CRUD
router.post("/", authMiddleware, createProduction);
router.get("/", authMiddleware, getProductions);
router.delete("/:sr_no", authMiddleware, deleteProduction);

module.exports = router;
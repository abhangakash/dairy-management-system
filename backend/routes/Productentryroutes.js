const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const {
  createProductEntry,
  getProductEntries,
  updateProductEntry,
  deleteProductEntry,
  getProductOptions,
  getDistributorOptions,
} = require("../controllers/productEntryController");

// Dropdown options
router.get("/options/products", authMiddleware, getProductOptions);
router.get("/options/distributors", authMiddleware, getDistributorOptions);

// IMPORTANT: specific routes must come BEFORE /:sr_no
router.post("/", authMiddleware, createProductEntry);
router.get("/", authMiddleware, getProductEntries);
router.put("/:sr_no", authMiddleware, updateProductEntry);
router.delete("/:sr_no", authMiddleware, deleteProductEntry);

module.exports = router;
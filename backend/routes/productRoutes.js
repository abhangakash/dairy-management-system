const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const {
  createProduct,
  getProducts,
  updateProduct,
  deleteProduct,
  toggleStatus,
} = require("../controllers/productController");

router.post("/", authMiddleware, createProduct);
router.get("/", authMiddleware, getProducts);
router.put("/:id", authMiddleware, updateProduct);
router.delete("/:id", authMiddleware, deleteProduct);
router.patch("/status/:id", authMiddleware, toggleStatus);

module.exports = router;
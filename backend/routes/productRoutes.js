const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const {
  createProduct,
  getProducts,
  getSingleProduct,
  updateProduct,
  deleteProduct,
  toggleStatus,
} = require("../controllers/productController");

router.post("/", authMiddleware, createProduct);
router.get("/", authMiddleware, getProducts);

// IMPORTANT: /status/:id must come BEFORE /:id
// otherwise Express treats "status" as the :id value
router.patch("/status/:id", authMiddleware, toggleStatus);

router.get("/:id", authMiddleware, getSingleProduct);
router.put("/:id", authMiddleware, updateProduct);
router.delete("/:id", authMiddleware, deleteProduct);

module.exports = router;
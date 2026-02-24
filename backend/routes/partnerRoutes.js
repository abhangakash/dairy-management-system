const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const {
  createPartner,
  getPartners,
  updatePartner,
  deletePartner,
  toggleStatus,
} = require("../controllers/partnerController");

router.post("/", authMiddleware, createPartner);
router.get("/", authMiddleware, getPartners);
router.put("/:id", authMiddleware, updatePartner);
router.delete("/:id", authMiddleware, deletePartner);
router.patch("/status/:id", authMiddleware, toggleStatus);

module.exports = router;
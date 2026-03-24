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
// status/:id MUST be before /:id
router.patch("/status/:id", authMiddleware, toggleStatus);
router.put("/:id", authMiddleware, updatePartner);
router.delete("/:id", authMiddleware, deletePartner);

module.exports = router;
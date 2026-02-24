const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const {
  createTransaction,
  getTransactions,
getDailyReport,
  getMonthlyReport,
  getProfitLoss,
  getLedger,
} = require("../controllers/transactionController");

router.post("/", authMiddleware, createTransaction);
router.get("/", authMiddleware, getTransactions);
router.get("/daily-report", authMiddleware, getDailyReport);
router.get("/monthly-report", authMiddleware, getMonthlyReport);
router.get("/profit-loss", authMiddleware, getProfitLoss);
router.get("/ledger", authMiddleware, getLedger);

module.exports = router;
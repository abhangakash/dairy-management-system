const express = require("express");
const cors = require("cors");
require("dotenv").config();
const db = require("./config/db");

const app = express();

// Body parser
app.use(express.json());

// === CORS setup for Codespaces ===
// Frontend URL
const FRONTEND_URL = "https://opulent-lamp-v6697qv9654rhxgr-5173.app.github.dev";

app.use(cors({
  origin: FRONTEND_URL,           // Allow your frontend
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true               // only needed if using cookies
}));

// Express automatically handles OPTIONS requests now

// === Routes import ===
const authRoutes = require("./routes/authRoutes");
const productRoutes = require("./routes/productRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const workerRoutes = require("./routes/workerRoutes");
const distributorRoutes = require("./routes/distributorRoutes");
const partnerRoutes = require("./routes/partnerRoutes");
const transactionRoutes = require("./routes/transactionRoutes");

// === API routes ===
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/workers", workerRoutes);
app.use("/api/distributors", distributorRoutes);
app.use("/api/partners", partnerRoutes);
app.use("/api/transactions", transactionRoutes);

// Test DB connection
app.get("/", (req, res) => {
  res.send("Dairy Management Backend Running 🚀");
});

app.get("/test-db", async (req, res) => {
  try {
    const [rows] = await db.query("SELECT 1");
    res.send("Database Connected Successfully 🚀");
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Database Connection Failed ❌" });
  }
});

// === Start server ===
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
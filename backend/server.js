const express = require("express");
const cors = require("cors");
require("dotenv").config();
const db = require("./config/db");
const app = express();

app.use(cors({
  origin: [
    "https://dairy-management-system-99z8.onrender.com"
  ],
  credentials: true
}));
app.use(express.json());

//rotes import
const authRoutes = require("./routes/authRoutes");
const authMiddleware = require("./middleware/authMiddleware");
const productRoutes = require("./routes/productRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const workerRoutes = require("./routes/workerRoutes");
const distributorRoutes = require("./routes/distributorRoutes");
const partnerRoutes = require("./routes/partnerRoutes");
const transactionRoutes = require("./routes/transactionRoutes");



//api 
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/workers", workerRoutes);
app.use("/api/distributors", distributorRoutes);
app.use("/api/partners", partnerRoutes);
app.use("/api/transactions", transactionRoutes);

// Test DB connection`
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

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
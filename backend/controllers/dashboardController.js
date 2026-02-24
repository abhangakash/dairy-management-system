const db = require("../config/db");

exports.getStats = async (req, res) => {
  try {
    const [[products]] = await db.query(
      "SELECT COUNT(*) as total FROM products WHERE deleted_at IS NULL"
    );

    res.json({
      totalProducts: products.total,
      totalWorkers: 0,
      totalDistributors: 0,
      totalSuppliers: 0,
    });

  } catch (error) {
    console.error("Dashboard Error:", error); // IMPORTANT
    res.status(500).json({ message: "Server Error" });
  }
};
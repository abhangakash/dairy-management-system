const db = require("../config/db");

// GET active distributors for dropdown
exports.getDistributorOptions = async (req, res) => {
  try {
    const [rows] = await db.query(
      "SELECT id, name FROM distributors WHERE deleted_at IS NULL AND status = 'active' ORDER BY name ASC"
    );
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};

// GET active products for dropdown
exports.getProductOptions = async (req, res) => {
  try {
    const [rows] = await db.query(
      "SELECT id, name FROM products WHERE deleted_at IS NULL AND status = 'active' ORDER BY name ASC"
    );
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};

// CREATE sell entries (multiple rows, one per product line)
exports.createSell = async (req, res) => {
  try {
    const { distributor_id, date, items } = req.body;

    if (!distributor_id) return res.status(400).json({ message: "Distributor is required" });
    if (!date) return res.status(400).json({ message: "Date is required" });
    if (!items || !Array.isArray(items) || items.length === 0)
      return res.status(400).json({ message: "At least one product line is required" });

    for (let i = 0; i < items.length; i++) {
      const { product_id, selling_unit } = items[i];
      if (!product_id) return res.status(400).json({ message: `Row ${i + 1}: Product is required` });
      if (!selling_unit || isNaN(selling_unit) || Number(selling_unit) < 1)
        return res.status(400).json({ message: `Row ${i + 1}: Selling units must be at least 1` });
    }

    const ip =
      req.headers["x-forwarded-for"]?.split(",")[0].trim() ||
      req.socket?.remoteAddress ||
      "unknown";

    const en_by = req.user?.username || req.user?.name || req.user?.email || "system";

    // Insert all rows
    const values = items.map(({ product_id, selling_unit }) => [
      distributor_id, product_id, selling_unit, date, new Date(), en_by, ip,
    ]);

    await db.query(
      `INSERT INTO sell (distributor_id, product_id, selling_unit, date, en_on, en_by, ip) VALUES ?`,
      [values]
    );

    res.status(201).json({ message: "Sell entries created successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};

// GET ALL sell entries (paginated + search)
exports.getSells = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = "" } = req.query;
    const offset = (page - 1) * limit;

    const [rows] = await db.query(
      `SELECT s.*, d.name AS distributor_name, p.name AS product_name
       FROM sell s
       JOIN distributors d ON s.distributor_id = d.id
       JOIN products p ON s.product_id = p.id
       WHERE d.name LIKE ? OR p.name LIKE ?
       ORDER BY s.id DESC LIMIT ? OFFSET ?`,
      [`%${search}%`, `%${search}%`, Number(limit), Number(offset)]
    );

    const [count] = await db.query(
      `SELECT COUNT(*) as total
       FROM sell s
       JOIN distributors d ON s.distributor_id = d.id
       JOIN products p ON s.product_id = p.id
       WHERE d.name LIKE ? OR p.name LIKE ?`,
      [`%${search}%`, `%${search}%`]
    );

    res.json({ data: rows, total: count[0].total });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};

// DELETE a sell entry
exports.deleteSell = async (req, res) => {
  try {
    const { id } = req.params;
    await db.query("DELETE FROM sell WHERE id=?", [id]);
    res.json({ message: "Sell entry deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};
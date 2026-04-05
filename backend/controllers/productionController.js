const db = require("../config/db");

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

// CREATE production entry
exports.createProduction = async (req, res) => {
  try {
    const { product_id, produced_unit, date } = req.body;

    if (!product_id) return res.status(400).json({ message: "Product is required" });
    if (!produced_unit || isNaN(produced_unit) || Number(produced_unit) < 1)
      return res.status(400).json({ message: "Produced units must be at least 1" });
    if (!date) return res.status(400).json({ message: "Date is required" });

    // Get IP from request
    const ip =
      req.headers["x-forwarded-for"]?.split(",")[0].trim() ||
      req.socket?.remoteAddress ||
      "unknown";

    // Get username from auth middleware (adjust field name to match your JWT payload)
    const en_by = req.user?.username || req.user?.name || req.user?.email || "system";

    await db.query(
      `INSERT INTO production (product_id, produced_unit, date, en_on, en_by, ip)
       VALUES (?, ?, ?, NOW(), ?, ?)`,
      [product_id, produced_unit, date, en_by, ip]
    );

    res.status(201).json({ message: "Production entry created successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};

// GET ALL production entries (paginated + search)
exports.getProductions = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = "" } = req.query;
    const offset = (page - 1) * limit;

    const [rows] = await db.query(
      `SELECT pr.*, p.name AS product_name
       FROM production pr
       JOIN products p ON pr.product_id = p.id
       WHERE p.name LIKE ?
       ORDER BY pr.sr_no DESC LIMIT ? OFFSET ?`,
      [`%${search}%`, Number(limit), Number(offset)]
    );

    const [count] = await db.query(
      `SELECT COUNT(*) as total
       FROM production pr
       JOIN products p ON pr.product_id = p.id
       WHERE p.name LIKE ?`,
      [`%${search}%`]
    );

    res.json({ data: rows, total: count[0].total });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};

// DELETE production entry
exports.deleteProduction = async (req, res) => {
  try {
    const { sr_no } = req.params;
    await db.query("DELETE FROM production WHERE sr_no=?", [sr_no]);
    res.json({ message: "Production entry deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};
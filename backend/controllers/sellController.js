const db = require("../config/db");

// GET active distributors for dropdown
exports.getDistributorOptions = async (req, res) => {
  try {
    const [rows] = await db.query(
      "SELECT id, name FROM distributors WHERE deleted_at IS NULL AND status = 'active' ORDER BY name ASC"
    );
    res.json(rows);
  } catch (error) {
    console.error("getDistributorOptions error:", error);
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
    console.error("getProductOptions error:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

// CREATE sell entries (multiple rows, one per product line)
exports.createSell = async (req, res) => {
  try {
    const { distributor_id, date_on, items } = req.body;

    // --- Validation ---
    if (!distributor_id && distributor_id !== 0)
      return res.status(400).json({ message: "Distributor is required" });

    if (!date_on)
      return res.status(400).json({ message: "Date is required" });

    if (!items || !Array.isArray(items) || items.length === 0)
      return res.status(400).json({ message: "At least one product line is required" });

    for (let i = 0; i < items.length; i++) {
      const { product_id, selling_unit } = items[i];

      if (!product_id && product_id !== 0)
        return res.status(400).json({ message: `Row ${i + 1}: Product is required` });

      if (!selling_unit || isNaN(selling_unit) || Number(selling_unit) < 1)
        return res.status(400).json({ message: `Row ${i + 1}: Selling units must be at least 1` });
    }

    // --- Meta ---
    const ip_address =
      req.headers["x-forwarded-for"]?.split(",")[0].trim() ||
      req.socket?.remoteAddress ||
      "unknown";

    const entry_by =
      req.user?.username || req.user?.name || req.user?.email || "system";

    // --- Insert ---
    // Keep distributor_id and product_id as-is (VARCHAR columns — no Number() cast)
    const insertPromises = items.map(({ product_id, selling_unit }) =>
      db.query(
        `INSERT INTO sell (distributor_id, product_id, selling_unit, date_on, entry_on, entry_by, ip_address)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          String(distributor_id),
          String(product_id),
          Number(selling_unit),
          date_on,
          new Date(),
          entry_by,
          ip_address,
        ]
      )
    );

    await Promise.all(insertPromises);

    res.status(201).json({ message: "Sell entries created successfully" });
  } catch (error) {
    console.error("createSell error:", error);
    res.status(500).json({ message: "Server Error", detail: error.message });
  }
};

// GET ALL sell entries (paginated + search)
exports.getSells = async (req, res) => {
  try {
    const page  = parseInt(req.query.page,  10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const search = req.query.search || "";
    const offset = (page - 1) * limit;

    const like = `%${search}%`;

    const [rows] = await db.query(
      `SELECT s.*, d.name AS distributor_name, p.name AS product_name
       FROM sell s
       JOIN distributors d ON s.distributor_id = d.id
       JOIN products p     ON s.product_id     = p.id
       WHERE d.name LIKE ? OR p.name LIKE ?
       ORDER BY s.id DESC
       LIMIT ? OFFSET ?`,
      [like, like, limit, offset]
    );

    const [count] = await db.query(
      `SELECT COUNT(*) AS total
       FROM sell s
       JOIN distributors d ON s.distributor_id = d.id
       JOIN products p     ON s.product_id     = p.id
       WHERE d.name LIKE ? OR p.name LIKE ?`,
      [like, like]
    );

    res.json({ data: rows, total: count[0].total });
  } catch (error) {
    console.error("getSells error:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

// DELETE a sell entry
exports.deleteSell = async (req, res) => {
  try {
    const { id } = req.params;
    await db.query("DELETE FROM sell WHERE id = ?", [id]);
    res.json({ message: "Sell entry deleted successfully" });
  } catch (error) {
    console.error("deleteSell error:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

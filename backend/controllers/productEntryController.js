const db = require("../config/db");

// CREATE
exports.createProductEntry = async (req, res) => {
  try {
    const { product_id, distributor_id, selling_price } = req.body;

    if (!product_id) return res.status(400).json({ message: "Product is required" });
    if (!distributor_id) return res.status(400).json({ message: "Distributor is required" });
    if (!selling_price || isNaN(selling_price) || Number(selling_price) <= 0)
      return res.status(400).json({ message: "Enter a valid selling price greater than 0" });

    await db.query(
      "INSERT INTO product_entry (product_id, distributor_id, selling_price) VALUES (?, ?, ?)",
      [product_id, distributor_id, selling_price]
    );
    res.status(201).json({ message: "Product Entry Created" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};

// GET ALL (with product and distributor names via JOIN)
exports.getProductEntries = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = "" } = req.query;
    const offset = (page - 1) * limit;

    const [rows] = await db.query(
      `SELECT pe.*, p.name AS product_name, d.name AS distributor_name
       FROM product_entry pe
       JOIN products p ON pe.product_id = p.id
       JOIN distributors d ON pe.distributor_id = d.id
       WHERE p.name LIKE ? OR d.name LIKE ?
       ORDER BY pe.sr_no DESC LIMIT ? OFFSET ?`,
      [`%${search}%`, `%${search}%`, Number(limit), Number(offset)]
    );

    const [count] = await db.query(
      `SELECT COUNT(*) as total
       FROM product_entry pe
       JOIN products p ON pe.product_id = p.id
       JOIN distributors d ON pe.distributor_id = d.id
       WHERE p.name LIKE ? OR d.name LIKE ?`,
      [`%${search}%`, `%${search}%`]
    );

    res.json({ data: rows, total: count[0].total });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};

// UPDATE
exports.updateProductEntry = async (req, res) => {
  try {
    const { sr_no } = req.params;
    const { product_id, distributor_id, selling_price } = req.body;

    if (!product_id) return res.status(400).json({ message: "Product is required" });
    if (!distributor_id) return res.status(400).json({ message: "Distributor is required" });
    if (!selling_price || isNaN(selling_price) || Number(selling_price) <= 0)
      return res.status(400).json({ message: "Enter a valid selling price greater than 0" });

    await db.query(
      "UPDATE product_entry SET product_id=?, distributor_id=?, selling_price=? WHERE sr_no=?",
      [product_id, distributor_id, selling_price, sr_no]
    );
    res.json({ message: "Product Entry Updated" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};

// DELETE
exports.deleteProductEntry = async (req, res) => {
  try {
    const { sr_no } = req.params;
    await db.query("DELETE FROM product_entry WHERE sr_no=?", [sr_no]);
    res.json({ message: "Product Entry Deleted" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};

// GET all active products for dropdown
exports.getProductOptions = async (req, res) => {
  try {
    const [rows] = await db.query(
      "SELECT id, name FROM products WHERE deleted_at IS NULL AND status = 'active' ORDER BY name ASC"
    );
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

// GET all active distributors for dropdown
exports.getDistributorOptions = async (req, res) => {
  try {
    const [rows] = await db.query(
      "SELECT id, name FROM distributors WHERE deleted_at IS NULL AND status = 'active' ORDER BY name ASC"
    );
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};
const db = require("../config/db");

// CREATE
exports.createDistributor = async (req, res) => {
  try {
    const { name, shop_name, mobile, address, credit_limit, distance } = req.body;
    if (!name?.trim()) return res.status(400).json({ message: "Name is required" });
    if (mobile && !/^\d{10}$/.test(mobile.trim()))
      return res.status(400).json({ message: "Enter a valid 10-digit mobile" });
    if (credit_limit && (isNaN(credit_limit) || Number(credit_limit) < 0))
      return res.status(400).json({ message: "Enter a valid credit limit" });
    if (distance && (isNaN(distance) || Number(distance) < 0))
      return res.status(400).json({ message: "Enter a valid distance" });

    await db.query(
      "INSERT INTO distributors (name, shop_name, mobile, address, credit_limit, distance) VALUES (?, ?, ?, ?, ?, ?)",
      [name.trim(), shop_name?.trim() || null, mobile?.trim() || null, address?.trim() || null, credit_limit || null, distance || null]
    );
    res.status(201).json({ message: "Distributor Created" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};

// GET
exports.getDistributors = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = "" } = req.query;
    const offset = (page - 1) * limit;

    const [rows] = await db.query(
      `SELECT * FROM distributors WHERE deleted_at IS NULL AND name LIKE ?
       ORDER BY id DESC LIMIT ? OFFSET ?`,
      [`%${search}%`, Number(limit), Number(offset)]
    );
    const [count] = await db.query(
      `SELECT COUNT(*) as total FROM distributors WHERE deleted_at IS NULL AND name LIKE ?`,
      [`%${search}%`]
    );
    res.json({ data: rows, total: count[0].total });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};

// UPDATE
exports.updateDistributor = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, shop_name, mobile, address, credit_limit, distance } = req.body;
    if (!name?.trim()) return res.status(400).json({ message: "Name is required" });
    if (mobile && !/^\d{10}$/.test(mobile.trim()))
      return res.status(400).json({ message: "Enter a valid 10-digit mobile" });
    if (credit_limit && (isNaN(credit_limit) || Number(credit_limit) < 0))
      return res.status(400).json({ message: "Enter a valid credit limit" });
    if (distance && (isNaN(distance) || Number(distance) < 0))
      return res.status(400).json({ message: "Enter a valid distance" });

    await db.query(
      "UPDATE distributors SET name=?, shop_name=?, mobile=?, address=?, credit_limit=?, distance=? WHERE id=?",
      [name.trim(), shop_name?.trim() || null, mobile?.trim() || null, address?.trim() || null, credit_limit || null, distance || null, id]
    );
    res.json({ message: "Distributor Updated" });
  } catch {
    res.status(500).json({ message: "Server Error" });
  }
};

// SOFT DELETE
exports.deleteDistributor = async (req, res) => {
  try {
    const { id } = req.params;
    await db.query("UPDATE distributors SET deleted_at = NOW() WHERE id=?", [id]);
    res.json({ message: "Distributor Archived" });
  } catch {
    res.status(500).json({ message: "Server Error" });
  }
};

// TOGGLE STATUS
exports.toggleStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await db.query("SELECT status FROM distributors WHERE id=?", [id]);
    if (rows.length === 0) return res.status(404).json({ message: "Distributor not found" });

    const newStatus = rows[0].status === "active" ? "inactive" : "active";
    await db.query("UPDATE distributors SET status=? WHERE id=?", [newStatus, id]);
    res.json({ message: "Status Updated", status: newStatus });
  } catch {
    res.status(500).json({ message: "Server Error" });
  }
};
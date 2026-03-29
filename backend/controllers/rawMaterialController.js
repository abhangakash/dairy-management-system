const db = require("../config/db");

// CREATE
exports.createRawMaterial = async (req, res) => {
  try {
    const { name, category, unit, price } = req.body;
    await db.query(
      "INSERT INTO raw_material (name, category, unit, price) VALUES (?, ?, ?, ?)",
      [name, category, unit, price]
    );
    res.status(201).json({ message: "Raw Material Created Successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};

// GET ALL
exports.getRawMaterials = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = "" } = req.query;
    const offset = (page - 1) * limit;

    const [rows] = await db.query(
      `SELECT * FROM raw_material
       WHERE deleted_at IS NULL AND name LIKE ?
       ORDER BY id DESC LIMIT ? OFFSET ?`,
      [`%${search}%`, Number(limit), Number(offset)]
    );

    const [count] = await db.query(
      `SELECT COUNT(*) as total FROM raw_material WHERE deleted_at IS NULL AND name LIKE ?`,
      [`%${search}%`]
    );

    res.json({ data: rows, total: count[0].total });
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

// GET SINGLE
exports.getSingleRawMaterial = async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await db.query(
      "SELECT * FROM raw_material WHERE id = ? AND deleted_at IS NULL",
      [id]
    );
    if (rows.length === 0) return res.status(404).json({ message: "Raw material not found" });
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

// UPDATE — only used when ONLY name changed (in-place)
exports.updateRawMaterial = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, category, unit, price } = req.body;
    await db.query(
      "UPDATE raw_material SET name=?, category=?, unit=?, price=? WHERE id=?",
      [name, category, unit, price, id]
    );
    res.json({ message: "Raw Material Updated Successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

// SOFT DELETE
exports.deleteRawMaterial = async (req, res) => {
  try {
    const { id } = req.params;
    await db.query("UPDATE raw_material SET deleted_at = NOW() WHERE id=?", [id]);
    res.json({ message: "Raw Material Archived Successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

// TOGGLE STATUS — archive old, create new (same as product pattern)
exports.toggleStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await db.query("SELECT status FROM raw_material WHERE id=?", [id]);
    if (rows.length === 0) return res.status(404).json({ message: "Raw material not found" });

    const newStatus = rows[0].status === 1 ? 0 : 1;
    await db.query("UPDATE raw_material SET status=? WHERE id=?", [newStatus, id]);
    res.json({ message: "Status Updated", status: newStatus });
  } catch {
    res.status(500).json({ message: "Server Error" });
  }
};
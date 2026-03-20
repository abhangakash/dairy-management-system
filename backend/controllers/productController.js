const db = require("../config/db");

// CREATE PRODUCT
exports.createProduct = async (req, res) => {
  try {
    const { name, category, unit, selling_price } = req.body;

    await db.query(
      "INSERT INTO products (name, category, unit, selling_price) VALUES (?, ?, ?, ?)",
      [name, category, unit, selling_price]
    );

    res.status(201).json({ message: "Product Created Successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};

// GET ALL PRODUCTS
exports.getProducts = async (req, res) => {
  try {
    const { page = 1, limit = 5, search = "" } = req.query;

    const offset = (page - 1) * limit;

    const [rows] = await db.query(
      `SELECT * FROM products
       WHERE deleted_at IS NULL
       AND name LIKE ?
       ORDER BY id DESC
       LIMIT ? OFFSET ?`,
      [`%${search}%`, Number(limit), Number(offset)]
    );

    const [count] = await db.query(
      `SELECT COUNT(*) as total FROM products
       WHERE deleted_at IS NULL
       AND name LIKE ?`,
      [`%${search}%`]
    );

    res.json({
      data: rows,
      total: count[0].total,
    });
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

// UPDATE PRODUCT
exports.updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, category, unit, selling_price } = req.body;

    await db.query(
      "UPDATE products SET name=?, category=?, unit=?, selling_price=? WHERE id=?",
      [name, category, unit, selling_price, id]
    );

    res.json({ message: "Product Updated Successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

// DELETE PRODUCT
exports.deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    await db.query(
      "UPDATE products SET deleted_at = NOW() WHERE id=?",
      [id]
    );

    res.json({ message: "Product Archived Successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

exports.toggleStatus = async (req, res) => {
  try {
    const { id } = req.params;

    const [rows] = await db.query(
      "SELECT status FROM products WHERE id=?",
      [id]
    );

    const newStatus =
      rows[0].status === "active" ? "inactive" : "active";

    await db.query(
      "UPDATE products SET status=? WHERE id=?",
      [newStatus, id]
    );

    res.json({ message: "Status Updated" });
  } catch {
    res.status(500).json({ message: "Server Error" });
  }
};
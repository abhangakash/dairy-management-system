const db = require("../config/db");

// CREATE PARTNER
exports.createPartner = async (req, res) => {
  try {
    const { name, mobile, investment_amount } = req.body;

    await db.query(
      "INSERT INTO partners (name, mobile, investment_amount) VALUES (?, ?, ?)",
      [name, mobile, investment_amount]
    );

    res.status(201).json({ message: "Partner Created" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};

// GET PARTNERS (Search + Pagination)
exports.getPartners = async (req, res) => {
  try {
    const { page = 1, limit = 5, search = "" } = req.query;
    const offset = (page - 1) * limit;

    const [rows] = await db.query(
      `SELECT * FROM partners
       WHERE deleted_at IS NULL
       AND name LIKE ?
       ORDER BY id DESC
       LIMIT ? OFFSET ?`,
      [`%${search}%`, Number(limit), Number(offset)]
    );

    const [count] = await db.query(
      `SELECT COUNT(*) as total FROM partners
       WHERE deleted_at IS NULL
       AND name LIKE ?`,
      [`%${search}%`]
    );

    res.json({
      data: rows,
      total: count[0].total,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};

// UPDATE PARTNER
exports.updatePartner = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, mobile, investment_amount } = req.body;

    await db.query(
      "UPDATE partners SET name=?, mobile=?, investment_amount=? WHERE id=?",
      [name, mobile, investment_amount, id]
    );

    res.json({ message: "Partner Updated" });
  } catch {
    res.status(500).json({ message: "Server Error" });
  }
};

// SOFT DELETE
exports.deletePartner = async (req, res) => {
  try {
    const { id } = req.params;

    await db.query(
      "UPDATE partners SET deleted_at = NOW() WHERE id=?",
      [id]
    );

    res.json({ message: "Partner Archived" });
  } catch {
    res.status(500).json({ message: "Server Error" });
  }
};

// TOGGLE STATUS
exports.toggleStatus = async (req, res) => {
  try {
    const { id } = req.params;

    const [rows] = await db.query(
      "SELECT status FROM partners WHERE id=?",
      [id]
    );

    const newStatus =
      rows[0].status === "active" ? "inactive" : "active";

    await db.query(
      "UPDATE partners SET status=? WHERE id=?",
      [newStatus, id]
    );

    res.json({ message: "Status Updated" });
  } catch {
    res.status(500).json({ message: "Server Error" });
  }
};
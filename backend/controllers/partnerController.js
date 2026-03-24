const db = require("../config/db");

// CREATE PARTNER
exports.createPartner = async (req, res) => {
  try {
    const { name, mobile, investment_amount } = req.body;
    if (!name?.trim()) return res.status(400).json({ message: "Name is required" });
    if (mobile && !/^\d{10}$/.test(mobile.trim()))
      return res.status(400).json({ message: "Enter a valid 10-digit mobile" });
    if (!investment_amount || isNaN(investment_amount) || Number(investment_amount) <= 0)
      return res.status(400).json({ message: "Enter a valid investment amount" });

    await db.query(
      "INSERT INTO partners (name, mobile, investment_amount) VALUES (?, ?, ?)",
      [name.trim(), mobile?.trim() || null, investment_amount]
    );
    res.status(201).json({ message: "Partner Created" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};

// GET PARTNERS
exports.getPartners = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = "" } = req.query;
    const offset = (page - 1) * limit;

    const [rows] = await db.query(
      `SELECT * FROM partners WHERE deleted_at IS NULL AND name LIKE ?
       ORDER BY id DESC LIMIT ? OFFSET ?`,
      [`%${search}%`, Number(limit), Number(offset)]
    );
    const [count] = await db.query(
      `SELECT COUNT(*) as total FROM partners WHERE deleted_at IS NULL AND name LIKE ?`,
      [`%${search}%`]
    );
    res.json({ data: rows, total: count[0].total });
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
    if (!name?.trim()) return res.status(400).json({ message: "Name is required" });
    if (mobile && !/^\d{10}$/.test(mobile.trim()))
      return res.status(400).json({ message: "Enter a valid 10-digit mobile" });
    if (!investment_amount || isNaN(investment_amount) || Number(investment_amount) <= 0)
      return res.status(400).json({ message: "Enter a valid investment amount" });

    await db.query(
      "UPDATE partners SET name=?, mobile=?, investment_amount=? WHERE id=?",
      [name.trim(), mobile?.trim() || null, investment_amount, id]
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
    await db.query("UPDATE partners SET deleted_at = NOW() WHERE id=?", [id]);
    res.json({ message: "Partner Archived" });
  } catch {
    res.status(500).json({ message: "Server Error" });
  }
};

// TOGGLE STATUS
exports.toggleStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await db.query("SELECT status FROM partners WHERE id=?", [id]);
    if (rows.length === 0) return res.status(404).json({ message: "Partner not found" });

    const newStatus = rows[0].status === "active" ? "inactive" : "active";
    await db.query("UPDATE partners SET status=? WHERE id=?", [newStatus, id]);
    res.json({ message: "Status Updated", status: newStatus });
  } catch {
    res.status(500).json({ message: "Server Error" });
  }
};
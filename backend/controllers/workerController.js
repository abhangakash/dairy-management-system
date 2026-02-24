const db = require("../config/db");

// CREATE WORKER
exports.createWorker = async (req, res) => {
  try {
    const { name, mobile, role, salary } = req.body;

    await db.query(
      "INSERT INTO workers (name, mobile, role, salary) VALUES (?, ?, ?, ?)",
      [name, mobile, role, salary]
    );

    res.status(201).json({ message: "Worker Created" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};

// GET WORKERS (Search + Pagination)
exports.getWorkers = async (req, res) => {
  try {
    const { page = 1, limit = 5, search = "" } = req.query;
    const offset = (page - 1) * limit;

    const [rows] = await db.query(
      `SELECT * FROM workers
       WHERE deleted_at IS NULL
       AND name LIKE ?
       ORDER BY id DESC
       LIMIT ? OFFSET ?`,
      [`%${search}%`, Number(limit), Number(offset)]
    );

    const [count] = await db.query(
      `SELECT COUNT(*) as total FROM workers
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

// UPDATE WORKER
exports.updateWorker = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, mobile, role, salary } = req.body;

    await db.query(
      "UPDATE workers SET name=?, mobile=?, role=?, salary=? WHERE id=?",
      [name, mobile, role, salary, id]
    );

    res.json({ message: "Worker Updated" });
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

// SOFT DELETE
exports.deleteWorker = async (req, res) => {
  try {
    const { id } = req.params;

    await db.query(
      "UPDATE workers SET deleted_at = NOW() WHERE id=?",
      [id]
    );

    res.json({ message: "Worker Archived" });
  } catch {
    res.status(500).json({ message: "Server Error" });
  }
};

// TOGGLE STATUS
exports.toggleStatus = async (req, res) => {
  try {
    const { id } = req.params;

    const [rows] = await db.query(
      "SELECT status FROM workers WHERE id=?",
      [id]
    );

    const newStatus =
      rows[0].status === "active" ? "inactive" : "active";

    await db.query(
      "UPDATE workers SET status=? WHERE id=?",
      [newStatus, id]
    );

    res.json({ message: "Status Updated" });
  } catch {
    res.status(500).json({ message: "Server Error" });
  }
};
const db = require("../config/db");

// GET all active workers for attendance form
exports.getWorkerOptions = async (req, res) => {
  try {
    const [rows] = await db.query(
      "SELECT id, name FROM workers WHERE deleted_at IS NULL AND status = 'active' ORDER BY name ASC"
    );
    res.json(rows);
  } catch (error) {
    console.error("getWorkerOptions error:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

// CREATE attendance entries (bulk — one per worker)
exports.createAttendance = async (req, res) => {
  try {
    const { date_on, entries } = req.body;

    // --- Validation ---
    if (!date_on)
      return res.status(400).json({ message: "Date is required" });

    if (!entries || !Array.isArray(entries) || entries.length === 0)
      return res.status(400).json({ message: "At least one attendance entry is required" });

    const VALID_STATUSES = ["present", "half_day", "absent"];

    for (let i = 0; i < entries.length; i++) {
      const { worker_id, status } = entries[i];

      if (!worker_id && worker_id !== 0)
        return res.status(400).json({ message: `Row ${i + 1}: Worker is required` });

      if (!status || !VALID_STATUSES.includes(status))
        return res.status(400).json({
          message: `Row ${i + 1}: Status must be present, half_day, or absent`,
        });
    }

    // --- Check for duplicate worker_ids in the payload ---
    const workerIds = entries.map((e) => String(e.worker_id));
    const uniqueIds = new Set(workerIds);
    if (uniqueIds.size !== workerIds.length)
      return res.status(400).json({ message: "Duplicate workers found in submission" });

    // --- Check if attendance already exists for this date ---
    const [existing] = await db.query(
      "SELECT worker_id FROM attendance WHERE date_on = ?",
      [date_on]
    );
    if (existing.length > 0) {
      const existingWorkerIds = existing.map((r) => String(r.worker_id));
      const conflicts = workerIds.filter((id) => existingWorkerIds.includes(id));
      if (conflicts.length > 0)
        return res.status(409).json({
          message: `Attendance already exists for ${conflicts.length} worker(s) on this date`,
        });
    }

    // --- Meta ---
    const ip_address =
      req.headers["x-forwarded-for"]?.split(",")[0].trim() ||
      req.socket?.remoteAddress ||
      "unknown";

    const entry_by =
      req.user?.username || req.user?.name || req.user?.email || "system";

    // --- Insert all entries ---
    const insertPromises = entries.map(({ worker_id, status }) =>
      db.query(
        `INSERT INTO attendance (worker_id, date_on, status, entry_by, entry_on, entry_ip)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [String(worker_id), date_on, status, entry_by, new Date(), ip_address]
      )
    );

    await Promise.all(insertPromises);

    res.status(201).json({
      message: `Attendance saved for ${entries.length} worker(s)`,
    });
  } catch (error) {
    console.error("createAttendance error:", error);
    res.status(500).json({ message: "Server Error", detail: error.message });
  }
};

// GET attendance records (paginated + search + date filter)
exports.getAttendance = async (req, res) => {
  try {
    const page   = parseInt(req.query.page,  10) || 1;
    const limit  = parseInt(req.query.limit, 10) || 10;
    const search = req.query.search || "";
    const date   = req.query.date   || "";
    const offset = (page - 1) * limit;

    const like = `%${search}%`;

    const conditions = ["(w.name LIKE ?)"];
    const params     = [like];

    if (date) {
      conditions.push("a.date_on = ?");
      params.push(date);
    }

    const where = "WHERE " + conditions.join(" AND ");

    const [rows] = await db.query(
      `SELECT a.*, w.name AS worker_name
       FROM attendance a
       JOIN workers w ON a.worker_id = w.id
       ${where}
       ORDER BY a.date_on DESC, a.id DESC
       LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    );

    const [count] = await db.query(
      `SELECT COUNT(*) AS total
       FROM attendance a
       JOIN workers w ON a.worker_id = w.id
       ${where}`,
      params
    );

    res.json({ data: rows, total: count[0].total });
  } catch (error) {
    console.error("getAttendance error:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

// DELETE a single attendance record
exports.deleteAttendance = async (req, res) => {
  try {
    const { id } = req.params;
    await db.query("DELETE FROM attendance WHERE id = ?", [id]);
    res.json({ message: "Attendance record deleted successfully" });
  } catch (error) {
    console.error("deleteAttendance error:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

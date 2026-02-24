const db = require("../config/db");

// CREATE TRANSACTION
exports.createTransaction = async (req, res) => {
  try {
    const {
      type,
      category,
      amount,
      payment_source,
      partner_id,
      entity_type,
      entity_id,
      description,
      transaction_date,
    } = req.body;

    await db.query(
      `INSERT INTO transactions
      (type, category, amount, payment_source, partner_id,
       entity_type, entity_id, description, transaction_date)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        type,
        category,
        amount,
        payment_source,
        partner_id || null,
        entity_type,
        entity_id || null,
        description,
        transaction_date,
      ]
    );

    res.status(201).json({ message: "Transaction Added" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};

exports.getTransactions = async (req, res) => {
  try {
    const { startDate, endDate, type } = req.query;

    let query = `
      SELECT * FROM transactions
      WHERE 1=1
    `;

    let params = [];

    if (startDate && endDate) {
      query += " AND transaction_date BETWEEN ? AND ?";
      params.push(startDate, endDate);
    }

    if (type && type !== "all") {
      query += " AND type = ?";
      params.push(type);
    }

    query += " ORDER BY transaction_date DESC";

    const [rows] = await db.query(query, params);

    res.json(rows);

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};

exports.getDailyReport = async (req, res) => {
  try {
    const { date } = req.query;

    const [income] = await db.query(
      `SELECT SUM(amount) as total
       FROM transactions
       WHERE type='income'
       AND transaction_date=?`,
      [date]
    );

    const [expense] = await db.query(
      `SELECT SUM(amount) as total
       FROM transactions
       WHERE type='expense'
       AND transaction_date=?`,
      [date]
    );

    res.json({
      date,
      totalIncome: income[0].total || 0,
      totalExpense: expense[0].total || 0,
      profit: (income[0].total || 0) - (expense[0].total || 0),
    });
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

exports.getMonthlyReport = async (req, res) => {
  try {
    const { month } = req.query; // format: 2026-02

    const [rows] = await db.query(
      `SELECT type, SUM(amount) as total
       FROM transactions
       WHERE DATE_FORMAT(transaction_date,'%Y-%m') = ?
       GROUP BY type`,
      [month]
    );

    let income = 0;
    let expense = 0;

    rows.forEach((r) => {
      if (r.type === "income") income = r.total;
      if (r.type === "expense") expense = r.total;
    });

    res.json({
      month,
      totalIncome: income,
      totalExpense: expense,
      profit: income - expense,
    });
  } catch {
    res.status(500).json({ message: "Server Error" });
  }
};

exports.getProfitLoss = async (req, res) => {
  try {
    const [income] = await db.query(
      "SELECT SUM(amount) as total FROM transactions WHERE type='income'"
    );

    const [expense] = await db.query(
      "SELECT SUM(amount) as total FROM transactions WHERE type='expense'"
    );

    const totalIncome = income[0].total || 0;
    const totalExpense = expense[0].total || 0;

    res.json({
      totalIncome,
      totalExpense,
      netProfit: totalIncome - totalExpense,
    });
  } catch {
    res.status(500).json({ message: "Server Error" });
  }
};

exports.getLedger = async (req, res) => {
  try {
    const { entity_type, entity_id } = req.query;

    const [rows] = await db.query(
      `SELECT *
       FROM transactions
       WHERE entity_type=? AND entity_id=?
       ORDER BY transaction_date ASC`,
      [entity_type, entity_id]
    );

    let balance = 0;

    const ledger = rows.map((t) => {
      if (t.type === "income") balance += Number(t.amount);
      else balance -= Number(t.amount);

      return {
        ...t,
        running_balance: balance,
      };
    });

    res.json(ledger);

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};
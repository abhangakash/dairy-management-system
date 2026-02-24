const db = require("../config/db");

exports.getStats = async (req, res) => {
  try {
    const [[products]] = await db.query(
      "SELECT COUNT(*) as total FROM products WHERE deleted_at IS NULL"
    );

    const [[workers]] = await db.query(
      "SELECT COUNT(*) as total FROM workers WHERE deleted_at IS NULL"
    );

    const [[distributors]] = await db.query(
      "SELECT COUNT(*) as total FROM distributors WHERE deleted_at IS NULL"
    );

    // const [[suppliers]] = await db.query(
    //   "SELECT COUNT(*) as total FROM suppliers WHERE deleted_at IS NULL"
    // );

    const [[income]] = await db.query(
      "SELECT SUM(amount) as total FROM transactions WHERE type='income'"
    );

    const [[expense]] = await db.query(
      "SELECT SUM(amount) as total FROM transactions WHERE type='expense'"
    );

    const [monthly] = await db.query(`
    SELECT 
      DATE_FORMAT(transaction_date,'%Y-%m') as month,
      SUM(CASE WHEN type='income' THEN amount ELSE 0 END) as income,
      SUM(CASE WHEN type='expense' THEN amount ELSE 0 END) as expense
    FROM transactions
    GROUP BY month
    ORDER BY month DESC
    LIMIT 6
  `);

  const [outstanding] = await db.query(`
    SELECT name, outstanding_balance
    FROM distributors
    WHERE deleted_at IS NULL
    ORDER BY outstanding_balance DESC
    LIMIT 5
  `); 

  const [partners] = await db.query(`
    SELECT name, investment_amount
    FROM partners
    WHERE deleted_at IS NULL
  `);

    res.json({
      totalProducts: products.total,
      totalWorkers: workers.total,
      totalDistributors: distributors.total,
      // totalSuppliers: suppliers.total,
      totalIncome: income.total || 0,
      totalExpense: expense.total || 0,
      netProfit: (income.total || 0) - (expense.total || 0),
      monthlyTrend: monthly.reverse(),
      outstandingDistributors: outstanding,
      partnerCapital: partners,
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};


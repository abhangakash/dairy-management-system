import { useEffect, useState } from "react";
import axios from "../../api/axios";
import Layout from "../../components/layout/Layout";

const TransactionList = () => {
  const [transactions, setTransactions] = useState([]);
  const [filters, setFilters] = useState({
    startDate: "",
    endDate: "",
    type: "all",
  });

  const fetchTransactions = async () => {
    const res = await axios.get("/transactions", {
      params: filters,
    });
    setTransactions(res.data);
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  const totalIncome = transactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const totalExpense = transactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + Number(t.amount), 0);

  return (
    <Layout>
      <div className="space-y-6">

        <h2 className="text-2xl font-bold text-gray-800">
          Transaction List
        </h2>

        {/* Filters */}
        <div className="bg-white p-6 rounded-xl shadow grid grid-cols-1 md:grid-cols-4 gap-4">
          <input
            type="date"
            value={filters.startDate}
            onChange={(e) =>
              setFilters({ ...filters, startDate: e.target.value })
            }
            className="border p-2 rounded-lg"
          />

          <input
            type="date"
            value={filters.endDate}
            onChange={(e) =>
              setFilters({ ...filters, endDate: e.target.value })
            }
            className="border p-2 rounded-lg"
          />

          <select
            value={filters.type}
            onChange={(e) =>
              setFilters({ ...filters, type: e.target.value })
            }
            className="border p-2 rounded-lg"
          >
            <option value="all">All</option>
            <option value="income">Income</option>
            <option value="expense">Expense</option>
          </select>

          <button
            onClick={fetchTransactions}
            className="bg-indigo-600 text-white rounded-lg px-4 py-2 hover:bg-indigo-700"
          >
            Apply Filter
          </button>
        </div>

        {/* Desktop Table */}
        <div className="hidden md:block bg-white rounded-xl shadow overflow-x-auto">
          <table className="min-w-full text-left">
            <thead className="bg-gray-50 text-gray-600 text-sm">
              <tr>
                <th className="p-3">Date</th>
                <th>Type</th>
                <th>Category</th>
                <th>Amount</th>
                <th>Source</th>
                <th>Description</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((t) => (
                <tr key={t.id} className="border-t hover:bg-gray-50">
                  <td className="p-3">{t.transaction_date}</td>
                  <td
                    className={
                      t.type === "income"
                        ? "text-green-600 font-medium"
                        : "text-red-600 font-medium"
                    }
                  >
                    {t.type}
                  </td>
                  <td>{t.category}</td>
                  <td>₹ {t.amount}</td>
                  <td>{t.payment_source}</td>
                  <td>{t.description}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile Cards */}
        <div className="md:hidden space-y-4">
          {transactions.map((t) => (
            <div
              key={t.id}
              className="bg-white p-4 rounded-xl shadow space-y-2"
            >
              <div className="flex justify-between">
                <span>{t.transaction_date}</span>
                <span
                  className={
                    t.type === "income"
                      ? "text-green-600 font-medium"
                      : "text-red-600 font-medium"
                  }
                >
                  ₹ {t.amount}
                </span>
              </div>
              <p className="text-sm text-gray-600">
                {t.category} • {t.payment_source}
              </p>
              <p className="text-sm">{t.description}</p>
            </div>
          ))}
        </div>

        {/* Summary */}
        <div className="bg-white p-6 rounded-xl shadow flex flex-col md:flex-row justify-between">
          <div className="text-green-600 font-semibold">
            Total Income: ₹ {totalIncome}
          </div>
          <div className="text-red-600 font-semibold">
            Total Expense: ₹ {totalExpense}
          </div>
          <div className="font-bold">
            Profit: ₹ {totalIncome - totalExpense}
          </div>
        </div>

      </div>
    </Layout>
  );
};

export default TransactionList;
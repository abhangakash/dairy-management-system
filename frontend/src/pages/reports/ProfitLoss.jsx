import { useEffect, useState } from "react";
import axios from "../../api/axios";
import Layout from "../../components/layout/Layout";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const ProfitLoss = () => {
  const [data, setData] = useState(null);

  const fetchData = async () => {
    const res = await axios.get("/transactions/profit-loss");
    setData(res.data);
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (!data) {
    return (
      <Layout>
        <p>Loading...</p>
      </Layout>
    );
  }

  const chartData = [
    { name: "Income", amount: data.totalIncome },
    { name: "Expense", amount: data.totalExpense },
  ];

  return (
    <Layout>
      <div className="space-y-6">

        <h2 className="text-2xl font-bold text-gray-800">
          Profit & Loss Overview
        </h2>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

          <div className="bg-white p-6 rounded-xl shadow text-center">
            <h3 className="text-gray-500 text-sm">
              Total Income
            </h3>
            <p className="text-3xl font-bold text-green-600 mt-2">
              ₹ {data.totalIncome}
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow text-center">
            <h3 className="text-gray-500 text-sm">
              Total Expense
            </h3>
            <p className="text-3xl font-bold text-red-600 mt-2">
              ₹ {data.totalExpense}
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow text-center">
            <h3 className="text-gray-500 text-sm">
              Net Profit
            </h3>
            <p
              className={`text-3xl font-bold mt-2 ${
                data.netProfit >= 0
                  ? "text-green-600"
                  : "text-red-600"
              }`}
            >
              ₹ {data.netProfit}
            </p>
          </div>

        </div>

        {/* Chart Section */}
        <div className="bg-white p-6 rounded-xl shadow h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="amount" fill="#6366f1" />
            </BarChart>
          </ResponsiveContainer>
        </div>

      </div>
    </Layout>
  );
};

export default ProfitLoss;
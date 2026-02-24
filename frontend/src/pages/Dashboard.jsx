import { useEffect, useState } from "react";
import axios from "../api/axios";
import Layout from "../components/layout/Layout";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
} from "recharts";

const Dashboard = () => {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    axios.get("/dashboard/stats")
      .then((res) => setStats(res.data))
      .catch(console.error);
  }, []);

  if (!stats) {
    return (
      <Layout>
        <div className="p-6">Loading...</div>
      </Layout>
    );
  }

  const pieData = [
    { name: "Income", value: stats.totalIncome },
    { name: "Expense", value: stats.totalExpense },
  ];

  return (
    <Layout>
      <div className="p-4 md:p-8 space-y-8">

        {/* Header */}
        <div>
          <h2 className="text-2xl font-bold text-gray-800">
            Business Overview
          </h2>
        </div>

        {/* KPI Compact Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            ["Products", stats.totalProducts],
            ["Workers", stats.totalWorkers],
            ["Distributors", stats.totalDistributors],
            ["Suppliers", stats.totalSuppliers],
          ].map(([label, value]) => (
            <div
              key={label}
              className="bg-white rounded-xl p-4 shadow-sm border"
            >
              <p className="text-gray-500 text-xs">{label}</p>
              <p className="text-xl font-bold text-indigo-600 mt-1">
                {value}
              </p>
            </div>
          ))}
        </div>

        {/* Finance Big Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

          <div className="bg-green-50 border border-green-200 rounded-2xl p-6">
            <p className="text-green-700 text-sm">Total Income</p>
            <p className="text-3xl font-bold text-green-600 mt-2">
              ₹ {stats.totalIncome}
            </p>
          </div>

          <div className="bg-red-50 border border-red-200 rounded-2xl p-6">
            <p className="text-red-700 text-sm">Total Expense</p>
            <p className="text-3xl font-bold text-red-600 mt-2">
              ₹ {stats.totalExpense}
            </p>
          </div>

          <div
            className={`rounded-2xl p-6 border ${
              stats.netProfit >= 0
                ? "bg-indigo-50 border-indigo-200"
                : "bg-yellow-50 border-yellow-200"
            }`}
          >
            <p className="text-gray-700 text-sm">Net Profit</p>
            <p
              className={`text-3xl font-bold mt-2 ${
                stats.netProfit >= 0
                  ? "text-indigo-600"
                  : "text-yellow-600"
              }`}
            >
              ₹ {stats.netProfit}
            </p>
          </div>

        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* Income vs Expense Donut */}
          <div className="bg-white rounded-2xl shadow-sm border p-6">
            <h3 className="font-semibold text-gray-700 mb-4">
              Income vs Expense
            </h3>

            <div className="w-full h-[280px]">
              <ResponsiveContainer>
                <PieChart>
                  <Pie
                    data={pieData}
                    dataKey="value"
                    innerRadius={70}
                    outerRadius={110}
                  >
                    <Cell fill="#16a34a" />
                    <Cell fill="#dc2626" />
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Monthly Trend */}
          <div className="bg-white rounded-2xl shadow-sm border p-6">
            <h3 className="font-semibold text-gray-700 mb-4">
              Monthly Trend (Last 6 Months)
            </h3>

            <div className="w-full h-[280px]">
              <ResponsiveContainer>
                <BarChart data={stats.monthlyTrend}>
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="income" fill="#16a34a" />
                  <Bar dataKey="expense" fill="#dc2626" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

        </div>

        {/* Bottom Widgets */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          {/* Outstanding Distributors */}
          <div className="bg-white rounded-2xl shadow-sm border p-6">
            <h3 className="font-semibold text-gray-700 mb-4">
              Top Outstanding Distributors
            </h3>

            <div className="space-y-3">
              {stats.outstandingDistributors?.length === 0 ? (
                <p className="text-sm text-gray-500">
                  No outstanding balances
                </p>
              ) : (
                stats.outstandingDistributors.map((d, index) => (
                  <div
                    key={index}
                    className="flex justify-between text-sm border-b pb-2"
                  >
                    <span>{d.name}</span>
                    <span className="text-red-600 font-medium">
                      ₹ {d.outstanding_balance}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Partner Capital */}
          <div className="bg-white rounded-2xl shadow-sm border p-6">
            <h3 className="font-semibold text-gray-700 mb-4">
              Partner Capital
            </h3>

            <div className="space-y-3">
              {stats.partnerCapital?.length === 0 ? (
                <p className="text-sm text-gray-500">
                  No partner data
                </p>
              ) : (
                stats.partnerCapital.map((p, index) => (
                  <div
                    key={index}
                    className="flex justify-between text-sm border-b pb-2"
                  >
                    <span>{p.name}</span>
                    <span className="text-indigo-600 font-medium">
                      ₹ {p.investment_amount}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>

      </div>
    </Layout>
  );
};

export default Dashboard;
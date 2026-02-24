import { useState } from "react";
import axios from "../../api/axios";
import Layout from "../../components/layout/Layout";

const DailyReport = () => {
  const [date, setDate] = useState("");
  const [report, setReport] = useState(null);

  const fetchReport = async () => {
    if (!date) return alert("Please select date");

    const res = await axios.get("/transactions/daily-report", {
      params: { date },
    });

    setReport(res.data);
  };

  return (
    <Layout>
      <div className="space-y-6">

        <h2 className="text-2xl font-bold text-gray-800">
          Daily Report
        </h2>

        {/* Date Filter */}
        <div className="bg-white p-6 rounded-xl shadow flex flex-col md:flex-row gap-4 items-center">
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="border p-2 rounded-lg"
          />

          <button
            onClick={fetchReport}
            className="bg-indigo-600 text-white rounded-lg px-6 py-2 hover:bg-indigo-700"
          >
            Generate Report
          </button>
        </div>

        {/* Report Cards */}
        {report && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

            {/* Income */}
            <div className="bg-white p-6 rounded-xl shadow text-center">
              <h3 className="text-gray-500 text-sm">
                Total Income
              </h3>
              <p className="text-3xl font-bold text-green-600 mt-2">
                ₹ {report.totalIncome}
              </p>
            </div>

            {/* Expense */}
            <div className="bg-white p-6 rounded-xl shadow text-center">
              <h3 className="text-gray-500 text-sm">
                Total Expense
              </h3>
              <p className="text-3xl font-bold text-red-600 mt-2">
                ₹ {report.totalExpense}
              </p>
            </div>

            {/* Profit / Loss */}
            <div className="bg-white p-6 rounded-xl shadow text-center">
              <h3 className="text-gray-500 text-sm">
                Net Result
              </h3>
              <p
                className={`text-3xl font-bold mt-2 ${
                  report.profit >= 0
                    ? "text-green-600"
                    : "text-red-600"
                }`}
              >
                ₹ {report.profit}
              </p>
            </div>

          </div>
        )}

      </div>
    </Layout>
  );
};

export default DailyReport;
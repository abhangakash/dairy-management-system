import { useEffect, useState } from "react";
import axios from "../api/axios";
import Layout from "../components/layout/Layout";

const Dashboard = () => {
  const [stats, setStats] = useState(null);

  const fetchStats = async () => {
    try {
      const res = await axios.get("/dashboard/stats");
      setStats(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  return (
    <Layout>
      <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-6">
        Dashboard Overview
      </h2>

      {!stats ? (
        <p>Loading...</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">

          <div className="bg-white p-5 rounded-xl shadow">
            <h3 className="text-gray-500 text-sm">Total Products</h3>
            <p className="text-2xl md:text-3xl font-bold text-indigo-600 mt-2">
              {stats.totalProducts}
            </p>
          </div>

          <div className="bg-white p-5 rounded-xl shadow">
            <h3 className="text-gray-500 text-sm">Total Workers</h3>
            <p className="text-2xl md:text-3xl font-bold text-indigo-600 mt-2">
              {stats.totalWorkers}
            </p>
          </div>

          <div className="bg-white p-5 rounded-xl shadow">
            <h3 className="text-gray-500 text-sm">Total Distributors</h3>
            <p className="text-2xl md:text-3xl font-bold text-indigo-600 mt-2">
              {stats.totalDistributors}
            </p>
          </div>

          <div className="bg-white p-5 rounded-xl shadow">
            <h3 className="text-gray-500 text-sm">Total Suppliers</h3>
            <p className="text-2xl md:text-3xl font-bold text-indigo-600 mt-2">
              {stats.totalSuppliers}
            </p>
          </div>

        </div>
      )}
    </Layout>
  );
};

export default Dashboard;
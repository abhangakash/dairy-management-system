import { useEffect, useState } from "react";
import axios from "../api/axios";
import Layout from "../components/layout/Layout";
import {
  AreaChart, Area, PieChart, Pie, Cell, ResponsiveContainer,
  Tooltip, XAxis, YAxis, CartesianGrid, Legend
} from "recharts";
import { Users, Package, Truck, Factory, ArrowUpRight, TrendingUp } from "lucide-react";

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    axios.get("/dashboard/stats")
      .then((res) => setStats(res.data))
      .catch(console.error);
  }, []);

  if (!stats) return <Layout><div className="flex h-screen items-center justify-center">Loading...</div></Layout>;

  const formatCurrency = (val) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val);

  const pieData = [
    { name: "Income", value: stats.totalIncome, color: "#10b981" },
    { name: "Expense", value: stats.totalExpense, color: "#ef4444" },
  ];

  return (
    <Layout>
      {/* Container with responsive padding */}
      <div className="min-h-screen bg-gray-50/50 p-3 md:p-6 lg:p-8">
        
        {/* Header Section: Stacks on mobile */}
        <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between mb-6 md:mb-8">
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 tracking-tight">Analytics</h1>
            <p className="text-sm text-gray-500 mt-1">Business performance at a glance.</p>
          </div>
          
          {/* Scrollable Tab Container for Mobile */}
          <div className="overflow-x-auto pb-2 md:pb-0">
            <div className="flex bg-white p-1 rounded-xl shadow-sm border min-w-max">
              <button 
                onClick={() => setActiveTab("overview")}
                className={`px-4 py-2 rounded-lg text-xs md:text-sm font-medium transition-all ${activeTab === 'overview' ? 'bg-indigo-600 text-white shadow-md' : 'text-gray-600 hover:bg-gray-100'}`}
              >
                Overview
              </button>
              <button 
                onClick={() => setActiveTab("financials")}
                className={`px-4 py-2 rounded-lg text-xs md:text-sm font-medium transition-all ${activeTab === 'financials' ? 'bg-indigo-600 text-white shadow-md' : 'text-gray-600 hover:bg-gray-100'}`}
              >
                Financials
              </button>
            </div>
          </div>
        </div>

        {/* KPI Grid: 1 column on mobile, 2 on tablet, 4 on desktop */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
          <KPICard label="Products" value={stats.totalProducts} icon={<Package size={18}/>} color="blue" />
          <KPICard label="Workers" value={stats.totalWorkers} icon={<Users size={18}/>} color="purple" />
          <KPICard label="Distributors" value={stats.totalDistributors} icon={<Truck size={18}/>} color="orange" />
          <KPICard label="Suppliers" value={stats.totalSuppliers} icon={<Factory size={18}/>} color="teal" />
        </div>

        {/* Main Content: Column on mobile, Grid on Desktop */}
        <div className="flex flex-col lg:grid lg:grid-cols-3 gap-6 md:gap-8">
          
          <div className="lg:col-span-2 space-y-6 md:space-y-8">
            {/* Chart Card */}
            <div className="bg-white p-4 md:p-6 rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-base md:text-lg font-bold text-gray-800">Revenue Trend</h3>
                <span className="hidden sm:flex text-[10px] md:text-xs font-semibold bg-green-100 text-green-700 px-2 py-1 rounded-full items-center gap-1">
                  <TrendingUp size={12}/> +12.5%
                </span>
              </div>
              
              {/* Responsive Chart Height */}
              <div className="h-[250px] md:h-[350px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={stats.monthlyTrend} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorInc" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.1}/>
                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                    <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10}} />
                    <YAxis tick={{fill: '#94a3b8', fontSize: 10}} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={{borderRadius: '12px', border: 'none', fontSize: '12px'}} />
                    <Area type="monotone" dataKey="income" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorInc)" />
                    <Area type="monotone" dataKey="expense" stroke="#ef4444" strokeWidth={2} strokeDasharray="5 5" fill="none" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Lists: Stack on mobile */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <ListWidget title="Outstanding" data={stats.outstandingDistributors} type="debt" />
              <ListWidget title="Capital" data={stats.partnerCapital} type="investment" />
            </div>
          </div>

          {/* Right Sidebar: Stacked on mobile */}
          <div className="space-y-6 md:space-y-8">
            <div className="bg-gradient-to-br from-indigo-600 to-violet-700 p-5 md:p-6 rounded-2xl shadow-xl text-white">
              <p className="opacity-80 text-xs md:text-sm font-medium">Net Profit</p>
              <h2 className="text-3xl md:text-4xl font-bold my-2 tracking-tight">{formatCurrency(stats.netProfit)}</h2>
              <div className="flex items-center gap-2 text-[10px] md:text-xs mt-4 bg-white/10 w-fit px-3 py-1 rounded-lg">
                <ArrowUpRight size={14} />
                <span>Performance: High</span>
              </div>
            </div>

            <div className="bg-white p-5 md:p-6 rounded-2xl shadow-sm border border-gray-100">
              <h3 className="text-base md:text-lg font-bold text-gray-800 mb-6">Cash Flow</h3>
              <div className="h-[200px] md:h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={pieData} innerRadius="60%" outerRadius="80%" paddingAngle={5} dataKey="value">
                      {pieData.map((entry, index) => <Cell key={index} fill={entry.color} />)}
                    </Pie>
                    <Tooltip />
                    <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', paddingTop: '20px' }}/>
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

        </div>
      </div>
    </Layout>
  );
};

const KPICard = ({ label, value, icon, color }) => {
  const colors = {
    blue: "bg-blue-50 text-blue-600",
    purple: "bg-purple-50 text-purple-600",
    orange: "bg-orange-50 text-orange-600",
    teal: "bg-teal-50 text-teal-600",
  };
  return (
    <div className="bg-white p-4 md:p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-3 md:gap-4 transition-transform active:scale-95">
      <div className={`p-2.5 md:p-3 rounded-xl ${colors[color]}`}>{icon}</div>
      <div className="min-w-0 flex-1">
        <p className="text-[10px] md:text-xs font-medium text-gray-400 uppercase tracking-wider truncate">{label}</p>
        <p className="text-lg md:text-2xl font-bold text-gray-900 truncate">{value}</p>
      </div>
    </div>
  );
};

const ListWidget = ({ title, data, type }) => (
  <div className="bg-white p-5 md:p-6 rounded-2xl shadow-sm border border-gray-100">
    <h3 className="text-sm md:text-base font-bold text-gray-800 mb-4">{title}</h3>
    <div className="space-y-4">
      {data?.length > 0 ? data.map((item, i) => (
        <div key={i} className="flex justify-between items-center group">
          <span className="text-xs md:text-sm text-gray-600 truncate mr-2">{item.name}</span>
          <span className={`text-xs md:text-sm font-bold whitespace-nowrap ${type === 'debt' ? 'text-red-500' : 'text-emerald-500'}`}>
            ₹{type === 'debt' ? item.outstanding_balance : item.investment_amount}
          </span>
        </div>
      )) : <p className="text-xs text-gray-400 italic">No data available</p>}
    </div>
  </div>
);

export default Dashboard;
import { useState, useContext } from "react";
import axios from "../api/axios";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { 
  ShieldCheck, 
  ChevronRight, 
  Lock, 
  User, 
  Loader2,
  Store,
  Box,
  Truck,
  LineChart,
  ShoppingBag,
  Layers
} from "lucide-react";

const Login = () => {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await axios.post("/auth/login", form);
      login(res.data.token);
      navigate("/dashboard");
    } catch (error) {
      alert("Access Denied: Commercial ERP Credentials Required.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#eceee4] p-4 md:p-8 font-sans text-slate-900 overflow-x-hidden">
      
      {/* Dynamic Background Glows */}
      <div className="absolute top-0 right-0 w-[300px] md:w-[500px] h-[300px] md:h-[500px] bg-blue-600/10 rounded-full blur-[80px] md:blur-[120px]"></div>
      <div className="absolute bottom-0 left-0 w-[300px] md:w-[500px] h-[300px] md:h-[500px] bg-indigo-600/10 rounded-full blur-[80px] md:blur-[120px]"></div>

      {/* MAIN CONTAINER */}
      <div className="w-full max-w-[1200px] min-h-[600px] lg:h-[750px] bg-white rounded-[32px] md:rounded-[48px] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)] overflow-hidden flex flex-col lg:flex-row border border-white/10 z-10">
        
        {/* LEFT PANEL: The Product Showroom (Stacks on top for mobile) */}
        <div className="w-full lg:w-[50%] bg-[#F8F9FF] p-8 md:p-12 flex flex-col justify-between relative overflow-hidden shrink-0">
          <div className="absolute inset-0 opacity-[0.03] pointer-events-none hidden md:block">
             <ShoppingBag className="absolute top-10 right-10 w-64 h-64 -rotate-12" />
          </div>

          <div className="relative z-10">
            {/* Logo Section */}
            <div className="flex items-center gap-4 mb-10 md:mb-16">
              <div className="p-2.5 md:p-3 bg-white rounded-2xl shadow-sm border border-slate-100 shrink-0">
                <img src="/24kb.png" alt="Milky Feast" className="w-10 h-10 md:w-12 md:h-12 object-contain" />
              </div>
              <div>
                <h1 className="text-xl md:text-2xl font-black tracking-tight text-slate-900 uppercase">
                  Milky<span className="text-blue-600">Feast</span>
                </h1>
                <p className="text-[9px] md:text-[10px] font-bold tracking-[0.3em] text-slate-400 uppercase">A Milk Product Company</p>
              </div>
            </div>

            <h2 className="text-4xl md:text-6xl font-black leading-[1] text-slate-900 mb-6">
              Manage <br /> <span className="text-blue-600 underline decoration-blue-100 underline-offset-4 md:underline-offset-8">Smarter.</span>
            </h2>

            <p className="text-slate-500 max-w-sm text-sm md:text-base font-medium leading-relaxed mb-8 md:mb-12">
              The premium hub for managing SKU inventory, wholesale distributors, and retail fulfillment.
            </p>

            {/* Modules Grid - 2 cols for desktop, icons scroll for small mobile */}
            <div className="grid grid-cols-2 gap-3 md:gap-4 max-w-md">
              {[
                { label: "Products", icon: <Box size={18}/> },
                { label: "Retail", icon: <Store size={18}/> },
                { label: "Logistics", icon: <Truck size={18}/> },
                { label: "Revenue", icon: <LineChart size={18}/> }
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-2 md:gap-3 bg-white p-3 md:p-4 rounded-xl md:rounded-2xl shadow-sm border border-slate-50 hover:border-blue-200 transition-all cursor-default group">
                  <div className="text-blue-600 group-hover:scale-110 transition-transform shrink-0">{item.icon}</div>
                  <span className="text-[10px] md:text-[11px] font-bold uppercase tracking-wider text-slate-600">{item.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom Trust Indicators - Hidden on mobile height constraints */}
          <div className="relative z-10 hidden sm:flex items-center gap-4 mt-8">
             <div className="flex -space-x-3">
               {[1,2,3].map(i => (
                 <div key={i} className="w-8 h-8 rounded-full border-2 border-white bg-slate-200 flex items-center justify-center text-[10px] font-bold text-slate-400">U{i}</div>
               ))}
             </div>
             <p className="text-[9px] md:text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-tight">Live Network</p>
          </div>
        </div>

        {/* RIGHT PANEL: Authentication Form */}
        <div className="w-full lg:w-[50%] p-8 md:p-12 lg:p-20 flex flex-col justify-center bg-white">
          <div className="max-w-[360px] mx-auto w-full">
            <header className="mb-8 md:mb-12">
              <h3 className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight mb-2">Login</h3>
              <p className="text-slate-400 text-sm font-medium">Access dashboard</p>
            </header>

            <form onSubmit={handleSubmit} className="space-y-5 md:space-y-7">
              <div className="space-y-1 md:space-y-2">
                <label className="text-[9px] md:text-[10px] font-black text-blue-600 uppercase tracking-[0.2em] ml-1">Admin Email</label>
                <div className="relative">
                  <User className="absolute left-0 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                  <input
                    type="email"
                    required
                    placeholder="manager@milkyfeast.com"
                    className="w-full bg-transparent border-b border-slate-200 py-3 md:py-4 pl-8 focus:border-blue-600 outline-none transition-all text-slate-800 font-semibold text-sm md:text-base"
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-1 md:space-y-2">
                <div className="flex justify-between items-center">
                   <label className="text-[9px] md:text-[10px] font-black text-blue-600 uppercase tracking-[0.2em] ml-1">Password</label>
                </div>
                <div className="relative">
                  <Lock className="absolute left-0 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    className="w-full bg-transparent border-b border-slate-200 py-3 md:py-4 pl-8 focus:border-blue-600 outline-none transition-all text-slate-800 font-semibold text-sm md:text-base"
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-slate-900 hover:bg-blue-600 text-white py-4 md:py-5 rounded-full font-black text-[10px] md:text-[11px] uppercase tracking-[0.3em] shadow-xl md:shadow-2xl shadow-blue-100 transition-all flex items-center justify-center gap-3 md:gap-4 group active:scale-[0.98] mt-4"
              >
                {isLoading ? <Loader2 className="animate-spin" /> : (
                  <>
                    <span>Enter Dashboard</span>
                    <ChevronRight size={18} className="group-hover:translate-x-2 transition-transform" />
                  </>
                )}
              </button>
            </form>

            {/* DESIGNED BY SECTION */}
            <footer className="mt-12 md:mt-20 flex flex-col items-center">
              <div className="flex items-center gap-2 mb-4 opacity-30">
                <ShieldCheck size={14} />
                <span className="text-[8px] md:text-[9px] font-bold uppercase tracking-widest">Secure </span>
              </div>
              <div className="group text-center">
                <p className="text-[9px] md:text-[10px] font-bold text-slate-300 uppercase tracking-[0.4em] mb-2 md:mb-3">Architecture by</p>
                <div className="bg-slate-50 px-4 md:px-6 py-2 rounded-xl border border-slate-100 group-hover:bg-blue-600 group-hover:border-blue-600 transition-all duration-300">
                   <span className="text-xs md:text-sm font-black text-slate-900 tracking-tighter group-hover:text-white transition-colors uppercase">Next Gen solutions</span>
                </div>
              </div>
            </footer>
          </div>
        </div>
      </div>

      {/* Footer Version (Mobile Only) */}
      <div className="absolute bottom-4 left-0 w-full text-center lg:hidden">
          <p className="text-[8px] font-bold text-slate-600 tracking-[0.3em] uppercase">V 2.4 Commercial Stable</p>
      </div>
    </div>
  );
};

export default Login;
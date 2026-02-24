import { NavLink } from "react-router-dom";
import { 
  LayoutDashboard, 
  Box, 
  Users, 
  Truck, 
  Handshake, 
  ReceiptIndianRupee, 
  Settings,
  LogOut,
  X
} from "lucide-react";
import logo from "/24kb.jpeg";

const Sidebar = ({ isOpen, setIsOpen }) => {
  
  const navItems = [
    { label: "Main Menu", isHeader: true },
    { to: "/dashboard", label: "Dashboard", icon: <LayoutDashboard size={20} /> },
    { to: "/products", label: "Products", icon: <Box size={20} /> },
    { to: "/workers", label: "Workers", icon: <Users size={20} /> },
    { label: "Partnerships", isHeader: true },
    { to: "/distributors", label: "Distributors", icon: <Truck size={20} /> },
    { to: "/partners", label: "Partners", icon: <Handshake size={20} /> },
    { label: "Finance", isHeader: true },
    { to: "/reports/ledger", label: "Transactions", icon: <ReceiptIndianRupee size={20} /> },
  ];

  const activeStyle = "bg-white/10 text-white border-r-4 border-indigo-400 shadow-sm";
  const idleStyle = "text-indigo-100 hover:bg-white/5 hover:text-white";

  return (
    <>
      {/* Overlay (Mobile) */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-indigo-950/60 backdrop-blur-sm z-40 md:hidden transition-opacity"
          onClick={() => setIsOpen(false)}
        />
      )}

      <div
        className={`
          fixed md:static top-0 left-0 z-50
          bg-indigo-900 text-white
          w-72 h-screen flex flex-col
          transform transition-all duration-300 ease-in-out
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
          md:translate-x-0 shadow-2xl
        `}
      >
        {/* Logo Section */}
        <div className="flex items-center justify-between p-6">
          <div className="flex items-center gap-3">
            <div className="bg-white p-1.5 rounded-xl shadow-inner">
              <img src={logo} alt="Logo" className="w-8 h-8 object-contain" />
            </div>
            <h1 className="text-xl font-black tracking-tight uppercase">Milky<span className="text-indigo-400">Feast</span></h1>
          </div>
          <button onClick={() => setIsOpen(false)} className="md:hidden text-indigo-300 hover:text-white">
            <X size={24} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-2 space-y-1 overflow-y-auto custom-scrollbar">
          {navItems.map((item, index) => (
            item.isHeader ? (
              <p key={index} className="text-[10px] font-bold uppercase tracking-widest text-indigo-400 pt-6 pb-2 px-4">
                {item.label}
              </p>
            ) : (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={() => window.innerWidth < 768 && setIsOpen(false)}
                className={({ isActive }) => `
                  flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all group
                  ${isActive ? activeStyle : idleStyle}
                `}
              >
                <span className="transition-transform group-hover:scale-110">{item.icon}</span>
                {item.label}
              </NavLink>
            )
          ))}
        </nav>

        {/* Bottom Profile/Settings */}
       
      </div>
    </>
  );
};

export default Sidebar;
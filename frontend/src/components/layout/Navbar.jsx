import { useContext } from "react";
import { AuthContext } from "../../context/AuthContext";
import { 
  Menu, 
  Search, 
  Bell, 
  Settings, 
  LogOut, 
  ChevronDown,
  User
} from "lucide-react";

const Navbar = ({ setIsOpen }) => {
  const { logout, user } = useContext(AuthContext); // Assuming user data exists in context

  return (
    <header className="sticky top-0 z-30 flex w-full bg-white/80 backdrop-blur-md border-b border-gray-100 px-4 py-3 md:px-8">
      <div className="flex w-full items-center justify-between">
        
        {/* Left Side: Menu Trigger & Page Context */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => setIsOpen(true)}
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-50 text-gray-600 transition-colors hover:bg-indigo-50 hover:text-indigo-600 md:hidden"
          >
            <Menu size={20} />
          </button>
          
          <div className="hidden md:block">
            <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">Workspace</p>
            <h1 className="text-lg font-bold text-gray-900 leading-tight">Admin Dashboard</h1>
          </div>
        </div>

        {/* Center: Search Bar (Market Standard Utility) */}
        <div className="hidden lg:flex flex-1 max-w-md mx-8">
          <div className="relative w-full group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-500 transition-colors" size={18} />
            <input 
              type="text" 
              placeholder="Search data, reports, transactions..."
              className="w-full bg-gray-50 border-none rounded-2xl py-2.5 pl-11 pr-4 text-sm focus:ring-2 focus:ring-indigo-500/20 transition-all outline-none"
            />
          </div>
        </div>

        {/* Right Side: Actions & Profile */}
        <div className="flex items-center gap-2 md:gap-4">
          
          {/* Notifications */}
          <button className="relative p-2.5 text-gray-500 hover:bg-gray-50 rounded-xl transition-colors">
            <Bell size={20} />
            <span className="absolute top-2 right-2.5 h-2 w-2 rounded-full bg-red-500 border-2 border-white"></span>
          </button>

          <div className="h-8 w-[1px] bg-gray-100 mx-1 hidden md:block"></div>

          {/* User Profile Dropdown Menu */}
          <div className="flex items-center gap-3 pl-2 group cursor-pointer">
            <div className="hidden md:block text-right leading-tight">
              <p className="text-sm font-semibold text-gray-900">{user?.name || "Admin User"}</p>
              <p className="text-[11px] font-medium text-indigo-500 uppercase tracking-tighter">Super Admin</p>
            </div>
            
            <div className="relative">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 p-[2px] shadow-lg shadow-indigo-200">
                <div className="h-full w-full bg-white rounded-[9px] flex items-center justify-center overflow-hidden">
                   <User className="text-indigo-600" size={20} />
                </div>
              </div>
            </div>

            <button 
              onClick={logout}
              className="ml-2 flex h-10 w-10 items-center justify-center rounded-xl text-gray-400 hover:bg-red-50 hover:text-red-600 transition-all"
              title="Logout"
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>

      </div>
    </header>
  );
};

export default Navbar;
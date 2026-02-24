import { Link } from "react-router-dom";
import logo from "/24kb.jpeg"; // adjust path if needed

const Sidebar = ({ isOpen, setIsOpen }) => {
  return (
    <>
      {/* Overlay (Mobile) */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-40 z-40 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      <div
        className={`
          fixed md:static top-0 left-0 z-50
          bg-indigo-800 text-white
          w-64 h-screen
          transform
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
          md:translate-x-0
          transition-transform duration-300 ease-in-out
          shadow-lg
        `}
      >
        {/* Logo Section */}
        <div className="flex items-center gap-3 p-6 border-b border-indigo-700">
          <img
            src={logo}
            alt="MilkyFeast Logo"
            className="w-10 h-10 object-contain "
          />
          <h1 className="text-xl font-bold ">MilkyFeast</h1>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-2">
          <Link
            to="/dashboard"
            className="block px-4 py-2 rounded hover:bg-indigo-700 transition"
          >
            Dashboard
          </Link>

          <Link
            to="/products"
            className="block px-4 py-2 rounded hover:bg-indigo-700 transition"
          >
            Products
          </Link>

          <Link
            to="/workers"
            className="block px-4 py-2 rounded hover:bg-indigo-700 transition"
          >
            Workers
          </Link>

          <Link
            to="/distributors"
            className="block px-4 py-2 rounded hover:bg-indigo-700 transition"
          >
            Distributors
          </Link>

          <Link
            to="/partners"
            className="block px-4 py-2 rounded hover:bg-indigo-700 transition"
          >
            Partners
          </Link>

          <Link
            to="/reports/ledger"
            className="block px-4 py-2 rounded hover:bg-indigo-700 transition"
          >
            Transactions
          </Link>
        </nav>
      </div>
    </>
  );
};

export default Sidebar;
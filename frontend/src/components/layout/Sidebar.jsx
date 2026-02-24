import { Link } from "react-router-dom";

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
          fixed md:static z-50
          bg-indigo-800 text-white
          w-64 h-full
          transform
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
          md:translate-x-0
          transition-transform duration-300
        `}
      >
        <div className="p-6 text-2xl font-bold border-b border-indigo-700">
          MilkyFeast
        </div>

        <nav className="p-4 space-y-2">
          <Link to="/dashboard" className="block px-4 py-2 rounded hover:bg-indigo-700">
            Dashboard
          </Link>
          <Link to="/products" className="block px-4 py-2 rounded hover:bg-indigo-700">
            Products
          </Link>
          <Link to="/workers" className="block px-4 py-2 rounded hover:bg-indigo-700">
            Workers
          </Link>
          <Link to="/distributors" className="block px-4 py-2 rounded hover:bg-indigo-700">
            Distributors
          </Link>
        </nav>
      </div>
    </>
  );
};

export default Sidebar;
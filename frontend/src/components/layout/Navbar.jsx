import { useContext } from "react";
import { AuthContext } from "../../context/AuthContext";

const Navbar = ({ setIsOpen }) => {
  const { logout } = useContext(AuthContext);

  return (
    <div className="bg-white shadow px-4 md:px-6 py-4 flex justify-between items-center">
      
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="md:hidden text-gray-700"
      >
        ☰
      </button>

      <h1 className="text-lg md:text-xl font-semibold text-gray-700">
        Admin Dashboard
      </h1>

      <button
        onClick={logout}
        className="bg-red-500 hover:bg-red-600 text-white px-3 md:px-4 py-2 rounded-lg text-sm md:text-base transition"
      >
        Logout
      </button>
    </div>
  );
};

export default Navbar;
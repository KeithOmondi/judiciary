import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { toast } from "react-toastify";
import { logout, resetAuthState } from "../../../store/slices/authSlice";

const Sidebar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const navLinks = [
    { to: "/dashboard", label: "Dashboard" },
    { to: "/books", label: "Books" },
    { to: "/my-borrows", label: "My Borrows" },
    { to: "/profile", label: "Profile" },
    { to: "/change-password", label: "Change Password" },
  ];

  const handleLogout = async () => {
  try {
    await dispatch(logout()).unwrap(); // Ensure logout succeeds
    dispatch(resetAuthState()); // Clear auth state manually
    toast.success("Logged out successfully."); // Optional toast
    navigate("/login");
  } catch (err) {
    toast.error(err || "Logout failed.");
  }
};


  return (
    <aside className="w-64 bg-white shadow-md min-h-screen flex flex-col">
      <div className="p-6 border-b border-gray-200 font-bold text-xl text-gray-800">
        User Menu
      </div>
      <nav className="flex flex-col p-4 space-y-2 flex-grow">
        {navLinks.map(({ to, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `block px-4 py-2 rounded-md font-medium text-gray-700 hover:bg-blue-100 hover:text-blue-700 ${
                isActive ? "bg-blue-500 text-white" : ""
              }`
            }
            end
          >
            {label}
          </NavLink>
        ))}
      </nav>
      <div className="p-4 border-t border-gray-200">
        <button
          onClick={handleLogout}
          className="w-full px-4 py-2 rounded-md font-medium text-red-700 bg-red-100 hover:bg-red-200 transition-colors duration-200 ease-in-out"
        >
          Logout
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;

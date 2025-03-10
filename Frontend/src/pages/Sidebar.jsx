import { NavLink, useNavigate } from "react-router-dom";
import {
  Home,
  Bell,
  MessageCircle,
  UserCircle,
  Settings,
  LogOut,
} from "lucide-react";
import { APIS } from "../../config/Config";

const navLinks = [
  { to: "/", label: "Home", icon: <Home size={24} /> },
  { to: "/notifications", label: "Notifications", icon: <Bell size={24} /> },
  { to: "/messages", label: "Messages", icon: <MessageCircle size={24} /> },
  { to: "/profile", label: "Profile", icon: <UserCircle size={24} /> },
  { to: "/settings", label: "Settings", icon: <Settings size={24} /> },
];

export const Sidebar = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    APIS.logout()
      .then(() => {
        console.log("Logout successful");
        navigate("/");
      })
      .catch((err) => console.log("Logout error:", err));
  };

  return (
    <>
      {/* Large Screens Sidebar */}
      <div className="fixed top-2 left-0 h-full w-64 lg:w-1/5 bg-gray-900 text-white p-4 transition-transform z-50 lg:translate-x-0 lg:relative hidden lg:block">
        <nav className="space-y-4">
          {navLinks.map(({ to, label, icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center gap-3 py-2 px-4 w-full text-left rounded-md transition ${
                  isActive ? "bg-gray-700 text-white" : "hover:bg-gray-800"
                }`
              }
            >
              {icon}
              <span>{label}</span>
            </NavLink>
          ))}

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 py-2 px-4 w-full text-left bg-red-600 hover:bg-red-700 rounded-md mt-4"
          >
            <LogOut size={24} />
            <span>Logout</span>
          </button>
        </nav>
      </div>

      {/* Small & Medium Screens Navbar */}
      <div className="flex lg:hidden w-full bg-white shadow-md py-3 px-4 justify-around fixed top-16 left-0 z-40">
        {navLinks.map(({ to, icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex flex-col items-center text-gray-700 ${
                isActive ? "text-red-600" : "hover:text-gray-500"
              }`
            }
          >
            {icon}
          </NavLink>
        ))}
      </div>
    </>
  );
};

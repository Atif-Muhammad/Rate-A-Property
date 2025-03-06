import { NavLink } from "react-router-dom";
import { Home, Bell, MessageCircle, UserCircle, Settings } from "lucide-react";

const navLinks = [
  { to: "/", label: "Home", icon: <Home size={24} /> },
  { to: "/notifications", label: "Notifications", icon: <Bell size={24} /> },
  { to: "/messages", label: "Messages", icon: <MessageCircle size={24} /> },
  { to: "/profile", label: "Profile", icon: <UserCircle size={24} /> },
  { to: "/settings", label: "Settings", icon: <Settings size={24} /> },
];

export const Sidebar = () => {
  return (
    <>
      {/* Large Screens Sidebar */}
      <div className="fixed top-2 left-0 h-full w-64 lg:w-1/5 bg-gray-900 text-white p-4 transition-transform z-50 lg:translate-x-0 lg:relative hidden lg:block">
        <nav className="space-y-4">
          {navLinks.map(({ to, label, icon }) => (
            <NavLink
              key={to}
              to={to}
              className="flex items-center gap-3 py-2 px-4 w-full text-left hover:bg-gray-800 rounded-md"
            >
              {icon}
              <span>{label}</span>
            </NavLink>
          ))}

          <NavLink to="/newPost">Post</NavLink>
        </nav>
      </div>

      {/* Small & Medium Screens Navbar */}
      <div className="flex lg:hidden w-full bg-white shadow-md py-3 px-4 justify-around fixed top-16 left-0 z-40">
        {navLinks.map(({ to, icon }) => (
          <NavLink
            key={to}
            to={to}
            className="flex flex-col items-center text-gray-700"
          >
            {icon}
          </NavLink>
        ))}
      </div>
    </>
  );
};

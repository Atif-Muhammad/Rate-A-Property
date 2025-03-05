import { NavLink } from "react-router-dom";
import { Home, Bell, MessageCircle, User, Settings } from "lucide-react";

export const Sidebar = () => {
  return (
    <>
      {/* Large Screens Sidebar */}
      <div className="fixed top-2 left-0 h-full w-64 lg:w-1/5 bg-gray-900 text-white p-4 transition-transform z-50 lg:translate-x-0 lg:relative hidden lg:block">
        <nav className="space-y-4">
          <NavLink
            to="/"
            className="flex items-center w-full py-2 px-4 text-left hover:bg-gray-800 rounded-md"
          >
            Home
          </NavLink>
          <NavLink
            to="/notifications"
            className="flex items-center w-full py-2 px-4 text-left hover:bg-gray-800 rounded-md"
          >
            Notifications
          </NavLink>
          <NavLink
            to="/messages"
            className="flex items-center w-full py-2 px-4 text-left hover:bg-gray-800 rounded-md"
          >
            Messages
          </NavLink>
          <NavLink
            to="/profile"
            className="flex items-center w-full py-2 px-4 text-left hover:bg-gray-800 rounded-md"
          >
            Profile
          </NavLink>
          <NavLink
            to="/settings"
            className="flex items-center w-full py-2 px-4 text-left hover:bg-gray-800 rounded-md"
          >
            Settings
          </NavLink>
        </nav>
      </div>

      {/* Small & Medium Screens Navbar */}
      <div className="flex lg:hidden w-full bg-white shadow-md py-3 px-4 justify-around fixed top-16 left-0 z-40">
        <NavLink to="/" className="flex flex-col items-center text-gray-700">
          <Home size={24} />
        </NavLink>
        <NavLink
          to="/notifications"
          className="flex flex-col items-center text-gray-700"
        >
          <Bell size={24} />
        </NavLink>
        <NavLink
          to="/messages"
          className="flex flex-col items-center text-gray-700"
        >
          <MessageCircle size={24} />
        </NavLink>
        <NavLink
          to="/profile"
          className="flex flex-col items-center text-gray-700"
        >
          <User size={24} />
        </NavLink>
        <NavLink
          to="/settings"
          className="flex flex-col items-center text-gray-700"
        >
          <Settings size={24} />
        </NavLink>
      </div>
    </>
  );
};

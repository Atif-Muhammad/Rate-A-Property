import React, { useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  Home,
  Bell,
  MessageCircle,
  UserCircle,
  Settings,
  LogOut,
  Compass,
} from "lucide-react";
import { APIS } from "../../config/Config";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ConfirmationModal } from "../components/models/ConfirmationModel";

export const Sidebar = () => {
  const queryClient = useQueryClient();
  const currentUser = queryClient.getQueryData(["userInfo"]);
  const [showConfirm, setShowConfirm] = useState(false);

  // console.log(currentUser);

  const navLinks = [
    { to: "/", label: "Home", icon: <Home size={24} /> },
    { to: "/discover", label: "Discover", icon: <Compass size={24} /> },
    { to: "/notifications", label: "Notifications", icon: <Bell size={24} /> },
    { to: "/messages", label: "Messages", icon: <MessageCircle size={24} /> },
    {
      to: `/profile/${currentUser?.user_name}`,
      label: "Profile",
      icon: <UserCircle size={24} />,
    },
    { to: "/settings", label: "Settings", icon: <Settings size={24} /> },
  ];

  const [isScrolled, setIsScrolled] = useState(false);
  const navigate = useNavigate();

  const confirmLogout = () => {
    setShowConfirm(false);
    APIS.logout()
      .then(() => {
        console.log("Logout successful");
        navigate("/");
      })
      .catch((err) => console.log("Logout error:", err));
  };

  const handleLogout = () => {
    setShowConfirm(true);
  };

  // use for top scroller
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 0) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      {/* Large Screens Sidebar */}
      <div className="h-full w-full bg-white text-gray-800 p-4 border-r border-gray-200 transition-transform z-50 lg:translate-x-0 lg:relative hidden lg:block">
        <nav className="space-y-4">
          {navLinks.map(({ to, label, icon }) => (
            <NavLink
              key={to}
              to={to}
              state={
                currentUser
                  ? { owner: currentUser, currentUser: currentUser }
                  : {}
              }
              className={({ isActive }) =>
                `flex items-center gap-3 py-2 px-4 w-full text-left rounded-lg transition font-medium ${
                  isActive
                    ? "bg-gray-100 text-blue-600"
                    : "hover:bg-gray-100 text-gray-700"
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
            className="flex items-center gap-3 py-2 px-4 w-full text-left bg-red-50 hover:bg-red-100 text-red-600 rounded-lg mt-6 font-medium"
          >
            <LogOut size={24} />
            <span>Logout</span>
          </button>
        </nav>
      </div>

      {/* Small & Medium Screens Navbar */}
      <div
        className={`flex lg:hidden w-full bg-white py-3 px-4 justify-around fixed left-0 z-40 transition-all duration-300 border-t border-gray-200 ${
          isScrolled ? "top-0 shadow-sm" : "top-16"
        }`}
      >
        {navLinks.map(({ to, icon }) => (
          <NavLink
            key={to}
            to={to}
            state={
              currentUser
                ? { owner: currentUser, currentUser: currentUser }
                : {}
            }
            className={({ isActive }) =>
              `flex flex-col items-center text-sm ${
                isActive ? "text-blue-600" : "text-gray-500 hover:text-blue-500"
              }`
            }
          >
            {icon}
          </NavLink>
        ))}
      </div>

      {showConfirm && (
        <ConfirmationModal
          title="Are you sure?"
          description="Do you really want to logout your account?"
          onCancel={() => setShowConfirm(false)}
          onConfirm={confirmLogout}
          button="Yes, Logout"
        />
      )}
    </>
  );

};

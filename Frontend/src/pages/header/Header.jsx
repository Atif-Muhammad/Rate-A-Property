import React from "react";
import { Search } from "lucide-react";
import { NavLink } from "react-router-dom";

export const Header = () => {
  return (
    <header className="h-16 md:px-4 px-2 bg-white border-b border-gray-400  w-full fixed top-0 left-0 z-50 flex justify-between items-center">
      {/* Logo */}
      <h1 className="text-xl font-bold text-gray-900">RateAProperty</h1>

      {/* Search Box (Hidden in sm, Shown in md+) */}
      <div className="relative hidden md:block">
        <input
          type="text"
          placeholder="Search..."
          className="pl-10 pr-4 py-2 border border-gray-300 rounded-full w-64 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <Search
          size={20}
          className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500"
        />
      </div>

      {/* Mobile Search Icon (Only in sm screens) */}
      <NavLink className="md:hidden">
        <Search size={24} className="text-gray-700" />
      </NavLink>

      {/* NavLinks (Sign In & Sign Up) */}
      <div className="flex items-center gap-2">
        <NavLink
          to="/signin"
          className="bg-blue-600 hover:bg-blue-700 text-white md:px-5 px-3 py-2 rounded-lg text-sm transition"
        >
          Sign In
        </NavLink>
        <NavLink
          to="/signup"
          className="bg-gray-600 hover:bg-gray-700 text-white md:px-5 px-3 py-2 rounded-lg text-sm transition"
        >
          Sign Up
        </NavLink>
      </div>
    </header>
  );
};

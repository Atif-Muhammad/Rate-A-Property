import React, { useEffect, useState } from "react";
import { Search } from "lucide-react";
import { NavLink } from "react-router-dom";
import { APIS } from "../../../config/Config";
import { arrayBufferToBase64 } from "../../ReUsables/arrayTobuffer";

export const Header = () => {
  const [user, setUser] = useState();
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    APIS.userWho()
      .then((res) => {
        if (res.status === 200) {
          APIS.getUser(res.data.id)
            .then((res) => {
              if (res.status === 200) {
                setUser(res.data);
                setLoading(false)
              }
            })
            .catch((err) => {
              setLoading(false);
              console.log(err);
            });
        }
      })
      .catch((err) => {
        console.log(err);
        setLoading(false);
      });
  }, []);

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
    <div className="flex items-center gap-2 h-full">
      {loading ? (
        <></>
      ) : user && user.image ? ( // Ensure user and image exist
        <div className="h-full w-full flex justify-end pe-4">
          <img
            className="rounded-full"
            src={`data:${user.image.contentType};base64,${arrayBufferToBase64(
              user.image.data.data
            )}`}
            alt="user profile"
          />
        </div>
      ) : (
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
      )}
      </div>
    </header>
  );
};

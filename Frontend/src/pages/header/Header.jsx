import React, { useEffect, useState } from "react";
import { Search } from "lucide-react";
import { NavLink } from "react-router-dom";
import { APIS } from "../../../config/Config";
import { arrayBufferToBase64 } from "../../ReUsables/arrayTobuffer";
import { NewPost } from "../../components/NewPost";
import { useQuery } from "@tanstack/react-query";

export const Header = () => {
  const [loading, setLoading] = useState(true);
  // open the new post model
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { data: currentUser = {}, isLoading } = useQuery({
    queryKey: ["user"],
    queryFn: async () => {
      const who = await APIS.userWho();
      const res = await APIS.getUser(who.data.id);
      const user = res.data;
      // console.log("user", res.data)
      return {
        id: user._id,
        image: user.image,
        user_name: user.user_name,
        posts: user.posts || [],
      };
    },
  });

  return (
    <header className="h-16 md:px-4 px-2  bg-white border-b border-gray-400  w-full sticky top-0 left-0 z-50 flex justify-between items-center">
      {/* Logo */}
      <NavLink className="text-xl font-bold text-gray-900" to="/">
        RateAProperty
      </NavLink>

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
      <div className="flex items-center gap-2 ">
        {isLoading ? (
          <>loading...</>
        ) : currentUser && currentUser.image ? ( // Ensure user and image exist
          <>
            {/* Button to Open Modal */}
            <button
              onClick={() => setIsModalOpen(true)}
              className="bg-blue-500 text-white px-4 py-2 rounded-md"
            >
              Create Post
            </button>
            <NewPost
              isOpen={isModalOpen}
              onClose={() => setIsModalOpen(false)}
            />

            <div className="w-12 h-12 rounded-full  flex items-center justify-center shadow-md transition-transform hover:scale-105">
              <img
                className="w-full h-full rounded-full object-cover border-2 border-white"
                src={`data:${
                  currentUser.image.contentType
                };base64,${arrayBufferToBase64(currentUser.image.data.data)}`}
                alt="user profile"
              />
            </div>
          </>
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

import React, { useContext, useEffect, useRef, useState } from "react";
import { Search, X } from "lucide-react";
import { NavLink } from "react-router-dom";
import { APIS } from "../../../config/Config";
import { arrayBufferToBase64 } from "../../ReUsables/arrayTobuffer";
import { NewPost } from "../../components/NewPost";
import { useQuery } from "@tanstack/react-query";
import context from "../../context/context";

export const Header = () => {
  const searchRef = useRef();
  const [query, setQuery] = useState("");
  // open the new post model
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { setUserQuery, userQuery } = useContext(context);
  const [showMobileSearch, setShowMobileSearch] = useState(false);

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

  const { data, refetch, isFetching, isError, error } = useQuery({
    queryKey: ["search"],
    queryFn: async () => await APIS.search(searchRef.current.value),
    enabled: false,
  });

  useEffect(() => {
    if (data?.data) {
      setUserQuery(data.data);
    }
  }, [data]);

  const handleSearch = async () => {
    refetch();
    // console.log(searchRef.current.value)
  };

  const handleCrossingSearch = async () => {
    setUserQuery("");
  };

  return (
    <header className="h-16 md:px-4 px-2  bg-white border-b border-gray-400  w-full sticky top-0 left-0 z-50 flex justify-between items-center">
      {/* Logo */}
      <NavLink className="text-xl font-bold text-gray-900" to="/">
        RateAProperty
      </NavLink>

      {/* Search Box (Hidden in sm, Shown in md+) */}
      <div className="relative hidden md:flex items-center">
        <Search
          size={20}
          className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500"
        />
        <input
          type="text"
          ref={searchRef}
          placeholder="Search..."
          className="pl-10 pr-20 py-2 border border-gray-300 rounded-full w-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        {userQuery ? (
          <X
            onClick={handleCrossingSearch}
            className="absolute right-2 cursor-pointer"
          />
        ) : (
          <button
            onClick={handleSearch}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-blue-500 text-white px-3 py-1 rounded-full hover:bg-blue-600 text-sm"
          >
            Search
          </button>
        )}
      </div>

      {/* Mobile Search Icon (Only in sm screens) */}
      <button onClick={() => setShowMobileSearch(true)} className="md:hidden">
        <Search size={24} className="text-gray-700" />
      </button>
      {showMobileSearch && (
        <div className="absolute top-16 left-0 w-full bg-white px-4 py-3 shadow-md border-b z-50 flex items-center gap-2 md:hidden">
          <input
            type="text"
            ref={searchRef}
            placeholder="Search..."
            className="flex-1 border border-gray-300 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={() => {
              handleSearch();
            }}
            className="bg-blue-500 text-white px-4 py-2 rounded-full text-sm"
          >
            Search
          </button>
          <X
            className="text-gray-500 ml-2 cursor-pointer"
            onClick={() => {
              handleCrossingSearch(); // CALL the function
              setShowMobileSearch(false); // Close the search box
            }}
          />
        </div>
      )}

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
                src={currentUser.image}
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

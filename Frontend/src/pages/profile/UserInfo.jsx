import React, { useState } from "react";
import { MoreHorizontal, MapPin, MessagesSquare, Share2 } from "lucide-react";
import { NavLink } from "react-router-dom";
import { EditProfileModal } from "./EditProfileModal";

export const UserInfo = () => {
  const [showModal, setShowModal] = useState(false);
  const [profile, setProfile] = useState({
    name: "John Doe",
    bio: "Hi, I’m John! I’m passionate about web technologie photography adventures.",
  });

  const handleOpen = () => setShowModal(true);
  const handleClose = () => setShowModal(false);

  const handleSave = (updatedData) => {
    setProfile(updatedData);
    handleClose();
  };
  const dummyPosts = [
    {
      id: 1,
      user: "Haris Khan",
      location: "New York City",
      time: "6 days ago",
      caption: "Exploring the streets of NYC!",
      image: "https://via.placeholder.com/500x300",
      agrees: 5,
      disagrees: 1,
    },
    {
      id: 2,
      user: "Sara Ali",
      location: "Paris, France",
      time: "2 days ago",
      caption: "Bonjour from the Eiffel Tower 🗼",
      image: "https://via.placeholder.com/500x300?text=Paris+Trip",
      agrees: 12,
      disagrees: 0,
    },
    {
      id: 3,
      user: "John Smith",
      location: "Tokyo, Japan",
      time: "1 week ago",
      caption: "Sakura season in Tokyo 🌸",
      image: "https://via.placeholder.com/500x300?text=Tokyo+Cherry+Blossoms",
      agrees: 9,
      disagrees: 2,
    },
  ];

  return (
    <div className="max-w-3xl bg-white mx-auto p-4 space-y-6 rounded-xl shadow">
      {/* Top Section */}
      <div className="flex flex-col items-center space-y-4">
        <div className="flex items-center space-x-6">
          <img
            src="https://via.placeholder.com/150"
            alt="profile"
            className="w-24 h-24 rounded-full object-cover border-4 border-blue-500"
          />
          <div className="flex flex-col space-y-2">
            <h1 className="text-xl font-semibold">{profile.name}</h1>
            <button
              onClick={handleOpen}
              className="px-4 py-1 rounded-md border text-sm font-medium hover:bg-gray-100 w-fit"
            >
              Edit Profile
            </button>
          </div>
        </div>

        {/* Bio ko neeche center mein la rahe hain */}
        <div className="text-center text-gray-600 text-sm max-w-md">
          {profile.bio}
        </div>

        {/* Stats section */}
        <div className="flex justify-center space-x-12 border-y py-4 w-full">
          <div className="text-center">
            <span className="block font-bold">120</span>
            <span className="text-sm text-gray-500">Posts</span>
          </div>
          <div className="text-center">
            <span className="block font-bold">4.5K</span>
            <span className="text-sm text-gray-500">Followers</span>
          </div>
          <div className="text-center">
            <span className="block font-bold">300</span>
            <span className="text-sm text-gray-500">Following</span>
          </div>
        </div>
      </div>

      {/* Dummy Posts */}
      {dummyPosts.map((post) => (
        <div
          key={post.id}
          className="bg-white shadow-md rounded-lg p-3.5 w-full lg:max-w-3xl border border-gray-200 mx-auto"
        >
          {/* Profile & Post Info */}
          <div className="flex items-center justify-between">
            <div className="flex items-center justify-between w-full space-x-3">
              <div className="flex items-center gap-x-3">
                <img
                  src={post.image}
                  alt="profile"
                  className="w-12 h-12 rounded-full border-2 border-blue-500"
                />

                <div className="leading-tight">
                  <p className="text-sm font-semibold text-black">
                    {post.user}
                  </p>
                  <span className="text-xs text-gray-500">{post.time}</span>
                </div>
              </div>

              <MoreHorizontal
                size={22}
                className="text-gray-500 cursor-pointer"
              />
            </div>
          </div>

          {/* Location */}
          <div className="bg-gray-100 text-[0.9rem] font-semibold text-blue-600 flex items-center tracking-wide justify-center px-2 py-2 mt-2 rounded-md hover:underline cursor-pointer">
            <MapPin size={16} className="text-blue-500 mr-1" />
            <a
              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                post.location
              )}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              {post.location}
            </a>
          </div>

          {/* Post Caption */}
          <p className="text-gray-800 text-sm mt-2">{post.caption}</p>

          {/* Post Image */}
          <div className="mt-2">
            <img
              src={post.image}
              alt="post"
              className="w-full rounded-md object-cover"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex justify-between gap-2 p-2 border-t border-gray-300 pt-3 items-center mt-4 text-gray-600 text-sm">
            <div className="flex items-center gap-x-4">
              <button className="flex items-center gap-x-1">
                Agree ({post.agrees})
              </button>

              <button className="flex items-center gap-x-1">
                Disagree ({post.disagrees})
              </button>
            </div>

            <NavLink
              to="#"
              className="flex items-center md:gap-x-2 hover:text-gray-700 transition"
            >
              <MessagesSquare size={22} />
              <span className="text-base hidden md:flex font-medium">
                Comment
              </span>
            </NavLink>

            <button className="flex items-center md:gap-x-2 hover:text-green-500 transition">
              <Share2 size={22} />
              <span className="text-base font-medium hidden md:flex">
                Share
              </span>
            </button>
          </div>
        </div>
      ))}

      {showModal && (
        <EditProfileModal
          onClose={handleClose}
          onSave={handleSave}
          initialData={profile}
        />
      )}
    </div>
  );
};

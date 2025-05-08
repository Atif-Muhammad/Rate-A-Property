import React from "react";
import { NavLink } from "react-router-dom";

const ProfileCard = ({ currentUser ,user }) => {
  console.log(user);
  return (
    <div className="flex items-center justify-between w-full bg-white p-2 rounded-lg shadow-sm max-w-xl mx-auto  border">
      {/* User Info */}
      <NavLink
        to={`/profile/${user?._id}`}
        className="flex items-center gap-3"
        state={{ owner: user, currentUser: currentUser }}
      >
        <img
          src={user?.image}
          alt="profile"
          className="w-12 h-12 rounded-full object-cover border border-blue-400"
        />
        <h2 className="text-base font-medium">{user?.user_name}</h2>
      </NavLink>

      <button className="text-sm bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 transition">
        Follow
      </button>
    </div>
  );
};

export default ProfileCard;

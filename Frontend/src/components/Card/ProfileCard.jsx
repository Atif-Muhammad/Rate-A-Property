import React from "react";

const ProfileCard = ({ user }) => {
  return (
    <div className="max-w-2xl mx-auto bg-white rounded-t-2xl shadow border">
      <div className="flex flex-col items-center gap-2 py-6">
        <div className="relative">
          <img
            src={user.image}
            alt="profile"
            className="w-28 h-28 rounded-full border-4 border-blue-500 object-cover"
          />
        </div>
        <h2 className="text-xl font-semibold">{user.user_name}</h2>
      </div>

      <hr className="border-t border-gray-300" />

      <div className="flex justify-around text-center py-4">
        <div>
          <p className="font-semibold">{user.posts?.length}</p>
          <p className="text-sm text-gray-500">Posts</p>
        </div>
        <div>
          <p className="font-semibold">{user.followers?.length}</p>
          <p className="text-sm text-gray-500">Followers</p>
        </div>
        <div>
          <p className="font-semibold">{user.following?.length}</p>
          <p className="text-sm text-gray-500">Following</p>
        </div>
      </div>

      <hr className="border-t border-gray-300" />
    </div>
  );
};

export default ProfileCard;

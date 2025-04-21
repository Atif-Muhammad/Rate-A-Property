import React from "react";
import PostSkeleton from "./PostSkeleton";

export const ProfileSkeleton = () => (
  <div className="max-w-3xl bg-white mx-auto p-4 space-y-6 rounded-xl shadow animate-pulse">
    <div className="flex flex-col items-center space-y-4">
      <div className="flex items-center space-x-6">
        <div className="w-24 h-24 rounded-full bg-gray-200"></div>
        <div className="flex flex-col space-y-2">
          <div className="h-6 w-32 bg-gray-200 rounded"></div>
          <div className="h-8 w-24 bg-gray-200 rounded"></div>
        </div>
      </div>
      <div className="flex justify-center space-x-12 border-y py-4 w-full">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="text-center">
            <div className="h-5 w-8 bg-gray-200 rounded mx-auto"></div>
            <div className="h-4 w-16 bg-gray-200 rounded mt-1 mx-auto"></div>
          </div>
        ))}
      </div>
    </div>
    {[...Array(3)].map((_, i) => (
      <PostSkeleton key={i} />
    ))}
  </div>
);

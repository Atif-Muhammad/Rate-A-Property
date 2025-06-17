import React from "react";

export const ChatsSkeleton = () => {
  return (
    <div className="bg-white border border-gray-300 rounded-xl shadow cursor-pointer p-4">
      <div className="flex items-center gap-3">
        <div className="relative">
          <div className="w-14 h-14 rounded-full bg-gray-200 animate-pulse border-2 border-gray-300"></div>
          <span className="absolute bottom-0 right-0 w-3 h-3 bg-gray-300 border-2 border-white rounded-full"></span>
        </div>
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-gray-200 rounded-full animate-pulse w-3/4"></div>
          <div className="h-3 bg-gray-200 rounded-full animate-pulse w-full"></div>
        </div>
        <div className="w-5 h-5 bg-gray-200 rounded-full animate-pulse"></div>
      </div>
    </div>
  );
};

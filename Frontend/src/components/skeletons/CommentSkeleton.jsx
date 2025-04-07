import React from "react";

function CommentSkeleton() {
  return (
    <>
    <div class="relative flex flex-col items-start space-y-2 p-4 rounded-lg shadow-sm bg-gray-100 animate-pulse">
      <div class="flex items-start space-x-3 w-full">
        <div class="w-12 h-12 bg-gray-200 rounded-full"></div>
        <div class="flex-1">
          <div class="flex items-center space-x-2">
            <div class="h-4 bg-gray-200 rounded w-full"></div>
          </div>
          <div class="h-3 bg-gray-200 rounded w-3/4 mt-1"></div>
          <div class="h-3 bg-gray-200 rounded w-2/3 mt-2"></div>
          <div class="flex space-x-4 text-sm text-gray-500 mt-2">
            <div class="h-3 bg-gray-200 rounded w-24"></div>
            <div class="h-3 bg-gray-200 rounded w-24"></div>
            <div class="h-3 bg-gray-200 rounded w-24"></div>
          </div>
        </div>
        <div class="h-6 bg-gray-200 rounded w-10"></div>
      </div>
      <div class="w-full h-4 bg-gray-200 rounded mt-4"></div>
      <div class="w-3/4 h-10 bg-gray-200 rounded mt-4"></div>
    </div>

    </>
  );
}

export default CommentSkeleton;

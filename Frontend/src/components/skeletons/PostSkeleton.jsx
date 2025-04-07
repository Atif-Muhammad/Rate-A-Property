import React from "react";

function PostSkeleton() {
  return (
    <div class="bg-gray-200 animate-pulse shadow-md rounded-lg p-3.5 w-full h-[50vh] lg:max-w-3xl border border-gray-300">
      <div class="flex items-center justify-between">
        <div class="flex items-center justify-between w-full space-x-3">
          <div class="flex items-center gap-x-3">
            <div class="w-12 h-12 rounded-full border-2 border-blue-500 bg-gray-400"></div>
            <div class="leading-tight">
              <div class="h-4 bg-gray-400 mt-1 rounded w-1/3"></div>
              <div class="h-4 bg-gray-400 mt-1 rounded w-1/4"></div>
            </div>
          </div>
        </div>
      </div>

      <div class="bg-gray-400 lg:text-sm md:text-sm text-[0.9rem] font-medium text-blue-600 flex items-center tracking-wide justify-center lg:px-5 md:px-3 px-2 py-2 mt-2 rounded-md">
        <div class="w-4 h-4 bg-gray-500 mr-1"></div>
        <div class="h-4 bg-gray-400 mt-1 rounded w-1/3"></div>
      </div>

      <div class="h-6 bg-gray-400 mt-2 rounded w-4/5"></div>

      <div class="flex justify-between gap-2 p-2 border-t border-gray-300 pt-3 items-center mt-4 text-gray-600 text-sm animate-pulse">
        <div class="flex items-center gap-x-4">
          <div class="flex items-center gap-x-1">
            <div class="h-4 bg-gray-400 rounded w-1/4"></div>
            <div class="h-4 bg-gray-400 rounded w-16"></div>
          </div>

          <div class="flex items-center gap-x-1">
            <div class="h-4 bg-gray-400 rounded w-1/4"></div>
            <div class="h-4 bg-gray-400 rounded w-16"></div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PostSkeleton;

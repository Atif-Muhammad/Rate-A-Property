import React from "react";
import { Link } from "react-router-dom";

export const NotFound = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-r from-black via-gray-900 to-black text-white px-6 text-center">
      <h1 className="text-9xl font-extrabold text-red-500 drop-shadow-lg">
        404
      </h1>
      <p className="text-3xl mt-4 font-semibold">Oops! Page Not Found</p>
      <p className="text-gray-300 mt-2 max-w-lg">
        The page you are looking for might have been removed, had its name
        changed, or is temporarily unavailable.
      </p>

      <Link
        to="/"
        className="mt-6 px-8 py-3 bg-red-600 text-white text-lg font-semibold rounded-full shadow-lg hover:bg-red-700 hover:scale-105 transition-all"
      >
        Go Back Home
      </Link>
    </div>
  );
};

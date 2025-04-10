import React from "react";
import { Outlet } from "react-router-dom";
import { Sidebar } from "./Sidebar";

export const LayoutForLanding = () => {
  return (
    <>
      <div className="relative flex justify-end bg-gray-200 h-full overflow-hidden">
       
        <div className="fixed top-[4rem] left-0 lg:w-64 h-[calc(100vh-4rem)] bg-gray-800 text-white">
          <Sidebar />
        </div>

        <div className="lg:ml-64 p-4 space-y-5 w-full h-full overflow-auto py-14 lg:py-6">
          <Outlet />
        </div>
      </div>
    </>
  );
};

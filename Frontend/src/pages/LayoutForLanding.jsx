import React from "react";
import { Outlet } from "react-router-dom";
import { Sidebar } from "./Sidebar";

export const LayoutForLanding = () => {
  return (
    <>
      <div className="flex  bg-gray-200 h-screen overflow-y-hidden">
        <Sidebar />
        <div className="p-4 space-y-5 w-full overflow-y-scroll py-14 lg:py-6 no-scrollbar">
          <Outlet />
        </div>
      </div>
    </>
  );
};

import React from "react";
import { Outlet } from "react-router-dom";
import { Sidebar } from "./Sidebar";

export const LayoutForLanding = () => {
  return (
    <>
      <div className="flex  bg-gray-200 h-full overflow-auto">
        <Sidebar />
        <div className="p-4 space-y-5 w-full h-full overflow-auto py-14 lg:py-6 ">
          <Outlet />
        </div>
      </div>
    </>
  );
};

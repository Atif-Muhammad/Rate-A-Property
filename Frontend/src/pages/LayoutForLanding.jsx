import React from "react";
import { Outlet } from "react-router-dom";
import { Sidebar } from "./Sidebar";

export const LayoutForLanding = () => {
  return (
    <>
      <div className="flex  h-screen overflow-y-hidden">
        <Sidebar />
        <Outlet />
      </div>
    </>
  );
};

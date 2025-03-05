import React from "react";
import { Outlet } from "react-router-dom";
import { Sidebar } from "./Sidebar";

export const LayoutForLanding = () => {
  return (
    <>
      <Sidebar />
      <Outlet />
    </>
  );
};

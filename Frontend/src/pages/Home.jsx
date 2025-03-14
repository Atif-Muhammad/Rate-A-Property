import React from "react";
import { PostDesign } from "./postdesign/PostDesign";
import { Sidebar } from "./Sidebar";
// import { Header } from "./header/Header";

export const Home = () => {
  return (
    <div className="w-full  overflow-y-hidden flex  ">
      {/* Main Content (Posts) */}
      <main className="flex-1 md:p-2  bg-gray-200 w-full lg:w-4/5 overflow-y-auto scrollbar-hide">
        <PostDesign />
      </main>
    </div>
  );
};

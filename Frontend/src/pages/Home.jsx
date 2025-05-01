import React, { useContext } from "react";
import { PostDesign } from "./postdesign/PostDesign";
import context from "../context/context";
import { useQueryClient } from "@tanstack/react-query";
import SearchDesign from "./postdesign/SearchDesign";

export const Home = () => {
  const {userQuery} = useContext(context);
  const queryClient = useQueryClient();
  // console.log("in home:", userQuery)
  return (
    <div className="w-full h-full overflow-y-hidden flex  ">
      {/* Main Content (Posts) */}
      <main className="flex-1 md:p-2 h-full w-full lg:w-4/5 overflow-y-auto scrollbar-hide">
        {userQuery ? <SearchDesign data={userQuery}/> :<PostDesign />}
      </main>
    </div>
  );
};

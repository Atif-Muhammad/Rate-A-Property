import React, { useContext, useEffect } from "react";
import ProfileCard from "../../components/Card/ProfileCard";
import PostCard from "../../components/post/PostCard";
import { useQueryClient } from "@tanstack/react-query";
import context from "../../context/context";

function SearchDesign({ data }) {
  const { userQuery, setUserQuery } = useContext(context);
  const queryClient = useQueryClient();

  const { users, posts } = data;
  const currentUser = queryClient.getQueryData(["userInfo"]);

  return (
    <div className=" flex flex-col gap-2  items-center ">
      {users?.length > 0 &&
        users?.map((user, index) => <ProfileCard key={index} user={user} />)}

      {posts?.length > 0 &&
        posts?.map((post, index) => (
          <PostCard key={index} post={post} currentUser={currentUser} />
        ))}
    </div>
  );
}

export default SearchDesign;

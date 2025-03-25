import React, { useState,useEffect } from "react";

import { APIS } from "../../../config/Config";
import PostCard from "../../components/post/PostCard";

export const PostDesign = () => {
  const [posts, setPosts] = useState([]);

  const getPosts = () => {
    APIS.getPosts()
      .then((res) => {
        if (res.status == 200) {
          setPosts(res.data);
        }
      })
      .catch((err) => {
        console.log(err);
      });
  };

  useEffect(() => {
    getPosts();
  }, []);

  // Function to delete post from UI
  const handlePostDel = (postId) => {
    APIS.delPost(postId)
      .then(() => {
        setPosts((prevPosts) =>
          prevPosts.filter((post) => post._id !== postId)
        );
      })
      .catch((err) => console.log(err));
  };

  return (
    <div className="w-full flex flex-col gap-5 items-center">
      {posts.map((post) => (
        <PostCard key={post._id} post={post} onDelete={handlePostDel} />
      ))}
    </div>
  );
};




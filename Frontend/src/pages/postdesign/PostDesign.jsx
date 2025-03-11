import React, { useState,useEffect } from "react";

import { APIS } from "../../../config/Config";
import PostCard from "../../components/Card/PostCard";

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

  

  return (
    <div className="p-4 space-y-5 w-full py-14 lg:py-6 flex flex-col items-center">
      {posts.map((post) => (
        <PostCard key={post.id} post={post} />
      ))}
    </div>
  );
};



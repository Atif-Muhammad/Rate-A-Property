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
    <div className="w-full flex flex-col gap-5 items-center">
      {posts.map((post) => (
        <PostCard key={post._id} post={post} />
      ))}
    </div>
  );
};



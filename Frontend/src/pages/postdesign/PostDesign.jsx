import React, { useState,useEffect } from "react";
import DiscoverSkeleton from '../../components/skeletons/DiscoverSkeleton'

import { APIS } from "../../../config/Config";
import PostCard from "../../components/post/PostCard";

export const PostDesign = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false)
  

  const getPosts = () => {
    setLoading(true)
    APIS.getPosts()
      .then((res) => {
        if (res.status == 200) {
          setPosts(res.data);
          setLoading(false)
        }
      })
      .catch((err) => {
        setLoading(false)
        console.log(err);
      });
  };
  useEffect(() => {
    getPosts();
    
  }, []);

  

  return (
    <div className="w-full flex flex-col gap-5 items-center">
      {!loading ? posts?.map((post) => (
        <PostCard key={post._id} post={post} />
      )): <DiscoverSkeleton/>}
    </div>
  );
};



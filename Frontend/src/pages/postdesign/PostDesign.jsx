import React, { useState, useEffect, useCallback } from "react";
import DiscoverSkeleton from "../../components/skeletons/DiscoverSkeleton";
import { APIS } from "../../../config/Config";
import PostCard from "../../components/post/PostCard";

export const PostDesign = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const LIMIT = 10;

  const getPosts = useCallback(async (pageToFetch) => {
    if (loading || !hasMore) return;
  
    setLoading(true);
    try {
      const res = await APIS.getPosts({ page: pageToFetch, limit: LIMIT });
      if (res.status === 200) {
        const { data, hasMore } = res.data;
        setPosts((prev) => [...prev, ...data]);
        setHasMore(hasMore);
      }
    } catch (err) {
      console.error("Error fetching posts:", err);
    } finally {
      setLoading(false);
    }
  }, [loading, hasMore]);
  
  

  useEffect(() => {
    setPage(1);
  }, []);
  

  useEffect(() => {
    getPosts(page);
  }, [page]);
  
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const windowHeight = window.innerHeight;
      const fullHeight = document.body.scrollHeight;
  
      if (
        scrollTop + windowHeight >= fullHeight - 100 &&
        !loading &&
        hasMore
      ) {
        setPage((prev) => prev + 1);
      }
    };
  
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [loading, hasMore]);
  
  

  return (
    <div className="w-full flex flex-col gap-5 items-center">
      {posts.map((post, index) => (
        <PostCard key={post._id + index} post={post} />
      ))}

      {loading && <DiscoverSkeleton />}
      {!hasMore && posts.length > 0 && (
        <p className="mt-4 text-gray-500">No more posts</p>
      )}
    </div>
  );
};

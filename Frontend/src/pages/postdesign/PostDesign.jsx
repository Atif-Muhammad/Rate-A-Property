import React, { useState, useEffect } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { APIS } from "../../../config/Config"; // Your API layer
import PostCard from "../../components/post/PostCard";
import DiscoverSkeleton from "../../components/skeletons/DiscoverSkeleton";
import { Loaders } from "../../Loaders/Loader";

const LIMIT = 10;

const fetchPosts = async ({ pageParam = 1 }) => {
  const res = await APIS.getPosts({ page: pageParam, limit: LIMIT });
  return {
    data: res.data.data,
    nextPage: pageParam + 1,
    hasMore: res.data.hasMore,
  };
};

export const PostDesign = () => {
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    status,
    isLoading,
  } = useInfiniteQuery({
    queryKey: ["posts"],
    queryFn: fetchPosts,
    getNextPageParam: (lastPage) =>
      lastPage.hasMore ? lastPage.nextPage : undefined,
  });

  // Infinite scroll
  useEffect(() => {
    const onScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } =
        document.documentElement;
      if (
        scrollTop + clientHeight >= scrollHeight - 100 &&
        hasNextPage &&
        !isFetchingNextPage
      ) {
        fetchNextPage();
      }
    };

    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  return (
    <div className="w-full flex flex-col gap-5 items-center">
      {data?.pages.map((page, pageIndex) =>
        page.data.map((post, idx) => (
          <PostCard key={post._id + "-" + pageIndex + "-" + idx} post={post} />
        ))
      )}

      {isLoading && !isFetchingNextPage && <DiscoverSkeleton />}
      {!isLoading && isFetchingNextPage && <Loaders />}

      {!hasNextPage && <p className="mt-4 text-gray-500">No more posts</p>}
    </div>
  );
};

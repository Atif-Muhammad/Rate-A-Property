import React, { useState, useEffect } from "react";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { APIS } from "../../../config/Config"; 
import PostCard from "../../components/post/PostCard";
import DiscoverSkeleton from "../../components/skeletons/DiscoverSkeleton";
import  Loader  from "../../Loaders/Loader";

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

  const { data: currentUser = {} } = useQuery({
    queryKey: ["user"],
    queryFn: async () => {
      const who = await APIS.userWho();
      const res = await APIS.getUser(who.data.id);
      const user = res.data;
      // console.log("user", res.data)
      return {
        id: user._id,
        image: user.image,
        user_name: user.user_name,
        posts: user.posts || [],
      };
    },
  });

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
    enabled: true
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
          <PostCard
            key={post._id + "-" + pageIndex + "-" + idx}
            post={post}
            currentUser={currentUser}
          />
        ))
      )}

      {isLoading && !isFetchingNextPage && <DiscoverSkeleton />}
      {!isLoading && isFetchingNextPage && <Loader />}

      {!hasNextPage && <p className="mt-4 text-gray-500">No more posts</p>}
    </div>
  );
};

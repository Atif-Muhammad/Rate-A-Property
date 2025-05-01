import React, { useState, useEffect, useContext } from "react";
import {
  useInfiniteQuery,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { APIS } from "../../../config/Config";
import PostCard from "../../components/post/PostCard";
import DiscoverSkeleton from "../../components/skeletons/DiscoverSkeleton";
import Loader from "../../Loaders/Loader";
// import context from "../../context/context";

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
  // const {userQuery} = useContext(context);
  const queryClient = useQueryClient();
  // get cached user
  const currentUser = queryClient.getQueryData(["userInfo"]);

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
    enabled: true,
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
            // onPostUpdated={handlePostUpdated}
          />
        ))
      )}

      {isLoading && !isFetchingNextPage && <DiscoverSkeleton />}
      {!isLoading && isFetchingNextPage && <Loader />}

      {!hasNextPage && <p className="mt-4 text-gray-500">No more posts</p>}
    </div>
  );
};

import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { EditProfileModal } from "./EditProfileModal";
import { APIS } from "../../../config/Config";
import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import PostCard from "../../components/post/PostCard";
import { useMemo } from "react";
import { ProfileSkeleton } from "../../components/skeletons/ProfileSkeleton";
import PostSkeleton from "../../components/skeletons/PostSkeleton";

export const UserInfo = () => {
  const location = useLocation();
  const { owner, currentUser } = location.state || {};
  const queryClient = useQueryClient();
  const LIMIT = 10;

  // Fetch profile data
  const { data: profile } = useQuery({
    queryKey: ["userProfile", owner?._id],
    queryFn: async () => {
      try {
        const data = await APIS.getUser(owner._id);
        // console.log("Fetched profile:", data);
        return data.data;
      } catch (err) {
        console.error("Failed to fetch profile:", err);
        throw err;
      }
    },
    enabled: !!owner?._id,
  });

  const isFollowing = profile?.followers?.includes(currentUser?._id);

  const followMutation = useMutation({
    mutationFn: async () => await APIS.followUser(currentUser._id, profile._id),

    onMutate: async () => {
      await queryClient.cancelQueries(["userProfile", profile._id]);
      await queryClient.cancelQueries(["userProfile", currentUser._id]);

      const prevProfileData = queryClient.getQueryData([
        "userProfile",
        profile._id,
      ]);
      const prevCurrentUserData = queryClient.getQueryData([
        "userProfile",
        currentUser._id,
      ]);

      queryClient.setQueryData(["userProfile", profile._id], (old) => ({
        ...old,
        followers: [...(old?.followers || []), currentUser._id],
      }));

      queryClient.setQueryData(["userProfile", currentUser._id], (old) => ({
        ...old,
        following: [...(old?.following || []), profile._id],
      }));

      return { prevProfileData, prevCurrentUserData };
    },

    onError: (err, _, context) => {
      queryClient.setQueryData(
        ["userProfile", profile._id],
        context.prevProfileData
      );
      queryClient.setQueryData(
        ["userProfile", currentUser._id],
        context.prevCurrentUserData
      );
    },

    onSuccess: () => {
      queryClient.invalidateQueries(["userProfile", profile._id]);
      queryClient.invalidateQueries(["userProfile", currentUser._id]);
      queryClient.invalidateQueries(["userPosts"]);
    },
  });

  const unfollowMutation = useMutation({
    mutationFn: async () =>
      await APIS.unfollowUser(currentUser._id, profile._id),

    onMutate: async () => {
      await queryClient.cancelQueries(["userProfile", profile._id]);
      await queryClient.cancelQueries(["userProfile", currentUser._id]);

      const prevProfileData = queryClient.getQueryData([
        "userProfile",
        profile._id,
      ]);
      const prevCurrentUserData = queryClient.getQueryData([
        "userProfile",
        currentUser._id,
      ]);

      queryClient.setQueryData(["userProfile", profile._id], (old) => ({
        ...old,
        followers: old?.followers?.filter((id) => id !== currentUser._id) || [],
      }));

      queryClient.setQueryData(["userProfile", currentUser._id], (old) => ({
        ...old,
        following: old?.following?.filter((id) => id !== profile._id) || [],
      }));

      return { prevProfileData, prevCurrentUserData };
    },

    onError: (err, _, context) => {
      queryClient.setQueryData(
        ["userProfile", profile._id],
        context.prevProfileData
      );
      queryClient.setQueryData(
        ["userProfile", currentUser._id],
        context.prevCurrentUserData
      );
    },

    onSuccess: () => {
      queryClient.invalidateQueries(["userProfile", profile._id]);
      queryClient.invalidateQueries(["userProfile", currentUser._id]);
      // queryClient.invalidateQueries(["userPosts"]);
    },
  });

  const fetchPosts = async ({ pageParam = 1 }) => {
    const res = await APIS.getUserPosts({
      page: pageParam,
      limit: LIMIT,
      userId: owner._id,
    });
    return {
      data: res.data.data,
      nextPage: pageParam + 1,
      hasMore: res.data.hasMore,
    };
  };

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useInfiniteQuery({
      queryKey: ["userPosts", owner?._id],
      queryFn: fetchPosts,
      getNextPageParam: (lastPage) =>
        lastPage.hasMore ? lastPage.nextPage : undefined,
      enabled: !!owner?._id,
    });
  console.log(owner);

  const [showModal, setShowModal] = useState(false);
  const handleOpen = () => setShowModal(true);
  const handleClose = () => setShowModal(false);

  const handleSave = (updatedData) => {
    queryClient.setQueryData(["userProfile", updatedData._id], updatedData);
    handleClose();
  };

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
    <div className="max-w-3xl bg-white mx-auto p-4 space-y-6 rounded-xl shadow">
      {/* If profile is loading, show skeleton */}
      {!profile ? (
        <ProfileSkeleton />
      ) : (
        <>
          {/* Top Section */}
          <div className="flex flex-col items-center space-y-4">
            <div className="flex items-center space-x-6">
              <img
                src={profile?.image}
                alt="profile"
                className="w-24 h-24 rounded-full object-cover border-3 border-blue-500"
              />
              <div className="flex flex-col space-y-3">
                <h1 className="text-xl font-semibold">{profile?.user_name}</h1>
                {profile?._id === currentUser?._id ? (
                  <button
                    onClick={handleOpen}
                    className="px-4 py-1.5 rounded-lg border border-gray-300 text-sm font-medium hover:bg-gray-50 w-fit transition-colors"
                  >
                    Edit Profile
                  </button>
                ) : isFollowing ? (
                  <button
                    onClick={() =>
                      unfollowMutation.mutate({
                        followerId: currentUser?._id,
                        followId: profile?._id,
                      })
                    }
                    className="px-4 py-1.5 rounded-lg border border-gray-300 bg-white text-sm font-medium hover:bg-gray-50 w-fit transition-colors"
                  >
                    Following
                  </button>
                ) : (
                  <button
                    onClick={() =>
                      followMutation.mutate({
                        followerId: currentUser?._id,
                        followId: profile?._id,
                      })
                    }
                    className="px-4 py-1.5 rounded-lg bg-black text-white text-sm font-medium hover:bg-gray-800 w-fit transition-colors"
                  >
                    Follow
                  </button>
                )}
              </div>
            </div>

            <div className="flex justify-center space-x-12 border-y py-4 w-full">
              <div className="text-center">
                <span className="block font-bold">
                  {profile?.posts?.length}
                </span>
                <span className="text-sm text-gray-500">Posts</span>
              </div>
              <div className="text-center">
                <span className="block font-bold">
                  {profile?.followers?.length}
                </span>
                <span className="text-sm text-gray-500">Followers</span>
              </div>
              <div className="text-center">
                <span className="block font-bold">
                  {profile?.following?.length}
                </span>
                <span className="text-sm text-gray-500">Following</span>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Post list or Post skeleton */}
      {!data
        ? Array.from({ length: 3 }).map((_, i) => <PostSkeleton key={i} />)
        : data.pages.map((page, pageIndex) =>
            page.data.map((post, idx) => (
              <PostCard
                key={post._id + "-" + pageIndex + "-" + idx}
                post={post}
                currentUser={currentUser}
              />
            ))
          )}

      {/* Edit Modal */}
      {showModal && (
        <EditProfileModal
          onClose={handleClose}
          onSave={handleSave}
          initialData={profile}
        />
      )}
    </div>
  );
};

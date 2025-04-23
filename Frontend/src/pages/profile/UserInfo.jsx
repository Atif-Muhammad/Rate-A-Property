import React, { useEffect, useState } from "react";
import { MoreHorizontal, MapPin, MessagesSquare, Share2 } from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";
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


export const UserInfo = () => {
  const location = useLocation();
  const { owner, currentUser } = location.state || {};
  console.log("state owner:", owner);
  const queryClient = useQueryClient();
  // const { data: userInfo = {} } = useQuery({
  //   queryKey: ["userInfo", owner?.id],
  //   queryFn: async () => await APIS.getUser(owner?.id),
  //   enabled: !!owner?.id && !owner?._id,
  // });

  // const ownerFinal = useMemo(() => {
  //   return owner?._id ? owner : userInfo?.data;
  // }, [owner, userInfo]);

  // const userPosts = owner?._id;
  const LIMIT = 10;

  const followMutation = useMutation({
    mutationFn: async ({ followerId, followId }) =>
      await APIS.followUser(followerId, followId),

    onMutate: async ({ followerId, followId }) => {
      await queryClient.cancelQueries(["userProfile", followId]);

      // Optimistic update: add follower ID
      queryClient.setQueryData(["userProfile", followId], (old) => ({
        ...old,
        followers: [...(old?.followers || []), followerId],
      }));
    },

    onError: (err, variables, context) => {
      // Rollback
      queryClient.invalidateQueries(["userProfile", variables.followId]);
      console.error("Error following user:", err);
    },

    onSuccess: () => {
      console.log("Followed successfully");
      queryClient.invalidateQueries(["userProfile"]); // refetch updated data
    },
  });

  // --- UNFOLLOW USER MUTATION ---
  const unfollowMutation = useMutation({
    mutationFn: async ({ followerId, followId }) =>
      await APIS.unfollowUser(followerId, followId),

    onMutate: async ({ followerId, followId }) => {
      await queryClient.cancelQueries(["userProfile", followId]);

      // Optimistic update: remove follower ID
      queryClient.setQueryData(["userProfile", followId], (old) => ({
        ...old,
        followers: old?.followers?.filter((id) => id !== followerId) || [],
      }));
    },

    onError: (err, variables, context) => {
      queryClient.invalidateQueries(["userProfile", variables.followId]);
      console.error("Failed to unfollow", err);
    },

    onSuccess: () => {
      console.log("Unfollowed successfully");
      queryClient.invalidateQueries(["userProfile"]);
    },
  });

  const fetchPosts = async ({ pageParam = 1 }) => {
    console.log("making call for user", owner);
    const res = await APIS.getUserPosts({
      page: pageParam,
      limit: LIMIT,
      userId: owner?.id ? owner?.id : owner?._id,
    });
    return {
      data: res.data.data,
      nextPage: pageParam + 1,
      hasMore: res.data.hasMore,
    };
  };

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    status,
    isLoading,
  } = useInfiniteQuery({
    queryKey: ["userPosts", owner?.id ? owner?.id : owner?._id],
    queryFn: fetchPosts,
    getNextPageParam: (lastPage) =>
      lastPage.hasMore ? lastPage.nextPage : undefined,
    enabled: !!owner,
  });

  console.log("current", currentUser);

  const [profile, setProfile] = useState(owner || {});

  const [showModal, setShowModal] = useState(false);

  const handleOpen = () => setShowModal(true);
  const handleClose = () => setShowModal(false);

  const handleSave = (updatedData) => {
    setProfile(updatedData);
    handleClose();
  };

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

  const handleFollow = (followerId, followId) => {
    followMutation.mutate({ followerId, followId });
  };

  const handleUnfollow = (followerId, followId) => {
    unfollowMutation.mutate({ followerId, followId });
  };

  return (
    <div className="max-w-3xl bg-white mx-auto p-4 space-y-6 rounded-xl shadow">
      {/* Top Section */}
      <div className="flex flex-col items-center space-y-4">
        <div className="flex items-center space-x-6">
          <img
            src={profile?.image}
            alt="profile"
            className="w-24 h-24 rounded-full object-cover border-4 border-blue-500"
          />
          <div className="flex flex-col space-y-2">
            <h1 className="text-xl font-semibold">{profile?.user_name}</h1>
            {profile?._id === currentUser?._id ? (
              <button
                onClick={handleOpen}
                className="px-4 py-1 rounded-md border text-sm font-medium hover:bg-gray-100 w-fit"
              >
                Edit Profile
              </button>
            ) : profile?.followers?.includes(currentUser?._id) ? (
              <button
                onClick={() => handleUnfollow(currentUser?._id, profile?._id)}
                className="px-4 py-1 rounded-md border text-sm font-medium hover:bg-gray-100 w-fit"
              >
                Unfollow
              </button>
            ) : (
              <button
                className="text-xs border px-2 py-0.5 cursor-pointer"
                onClick={() => handleFollow(currentUser?._id, profile?._id)}
              >
                Follow
              </button>
            )}
          </div>
        </div>

        {/* Bio ko neeche center mein la rahe hain */}
        {/* <div className="text-center text-gray-600 text-sm max-w-md">
          {profile.bio}
        </div> */}

        {/* Stats section */}
        <div className="flex justify-center space-x-12 border-y py-4 w-full">
          <div className="text-center">
            <span className="block font-bold">{profile?.posts?.length}</span>
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

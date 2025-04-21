import React, { useEffect, useState } from "react";
import { MoreHorizontal, MapPin, MessagesSquare, Share2 } from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";
import { EditProfileModal } from "./EditProfileModal";
import { APIS } from "../../../config/Config";
import {
  useInfiniteQuery,
  useQuery,
  useQueryClient,
  useMutation,
} from "@tanstack/react-query";
import PostCard from "../../components/post/PostCard";
import { useMemo } from "react";
import PostSkeleton from "../../components/skeletons/PostSkeleton";
import { ProfileSkeleton } from "../../components/skeletons/ProfileSkeleton";

export const UserInfo = () => {
  const location = useLocation();
  const { owner: initialOwner, currentUser } = location.state || {};
  const queryClient = useQueryClient();
  const [showModal, setShowModal] = useState(false);
  const LIMIT = 10;

  // Fetch profile data using React Query
  const {
    data: profile,
    isLoading: profileLoading,
    refetch: refetchProfile,
  } = useQuery({
    queryKey: ["userProfile", initialOwner?._id],
    queryFn: () => APIS.getUserProfile(initialOwner?._id),
    initialData: initialOwner, // Use location state as initial data
    enabled: !!initialOwner?._id,
  });

  // Derive isFollowing from the profile data
  const isFollowing = profile?.followers?.includes(currentUser?._id) || false;

  // Optimistic follow/unfollow mutations
  const { mutate: followUser } = useMutation({
    mutationFn: (followId) => APIS.followUser(currentUser?._id, followId),
    onMutate: async (followId) => {
      // Cancel any outgoing refetches to avoid overwriting optimistic update
      await queryClient.cancelQueries(["userProfile", followId]);

      // Optimistically update the profile
      queryClient.setQueryData(["userProfile", followId], (old) => ({
        ...old,
        followers: [...(old.followers || []), currentUser?._id],
      }));
    },
    onSuccess: () => {
      // Invalidate both profile and posts queries
      queryClient.invalidateQueries(["userProfile", profile._id]);
      queryClient.invalidateQueries(["userPosts"]);
    },
    onError: (err, followId) => {
      // Revert on error
      queryClient.invalidateQueries(["userProfile", followId]);
    },
  });

  const { mutate: unfollowUser } = useMutation({
    mutationFn: (followId) => APIS.unfollowUser(currentUser?._id, followId),
    onMutate: async (followId) => {
      await queryClient.cancelQueries(["userProfile", followId]);

      queryClient.setQueryData(["userProfile", followId], (old) => ({
        ...old,
        followers: old.followers?.filter((id) => id !== currentUser?._id),
      }));
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["userProfile", profile._id]);
      queryClient.invalidateQueries(["userPosts"]);
    },
    onError: (err, followId) => {
      queryClient.invalidateQueries(["userProfile", followId]);
    },
  });

  const handleFollowAction = () => {
    if (isFollowing) {
      unfollowUser(profile._id);
    } else {
      followUser(profile._id);
    }
  };

  // Fetch posts
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading: postsLoading,
  } = useInfiniteQuery({
    queryKey: ["userPosts", profile?._id],
    queryFn: async ({ pageParam = 1 }) => {
      const res = await APIS.getUserPosts({
        page: pageParam,
        limit: LIMIT,
        userId: profile?._id,
      });
      return {
        data: res.data.data,
        nextPage: pageParam + 1,
        hasMore: res.data.hasMore,
      };
    },
    getNextPageParam: (lastPage) =>
      lastPage.hasMore ? lastPage.nextPage : undefined,
    enabled: !!profile?._id,
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

  // Refetch profile when currentUser changes (when visiting own profile)
  useEffect(() => {
    if (profile?._id === currentUser?._id) {
      refetchProfile();
    }
  }, [currentUser, profile?._id, refetchProfile]);

  if (!profile || profileLoading) {
    return <ProfileSkeleton />;
  }

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
                onClick={() => setShowModal(true)}
                className="px-4 py-1 rounded-md border text-sm font-medium hover:bg-gray-100 w-fit"
              >
                Edit Profile
              </button>
            ) : (
              <button
                className={`px-4 py-1 rounded-md text-sm font-medium w-fit transition-all ${
                  isFollowing
                    ? "bg-gray-100 hover:bg-gray-200 border"
                    : "bg-blue-500 hover:bg-blue-600 text-white"
                }`}
                onClick={handleFollowAction}
              >
                {isFollowing ? "Following" : "Follow"}
              </button>
            )}
          </div>
        </div>

        {/* Stats section */}
        <div className="flex justify-center space-x-12 border-y py-4 w-full">
          <div className="text-center">
            <span className="block font-bold">
              {profile?.posts?.length || 0}
            </span>
            <span className="text-sm text-gray-500">Posts</span>
          </div>
          <div className="text-center">
            <span className="block font-bold">
              {profile?.followers?.length || 0}
            </span>
            <span className="text-sm text-gray-500">Followers</span>
          </div>
          <div className="text-center">
            <span className="block font-bold">
              {profile?.following?.length || 0}
            </span>
            <span className="text-sm text-gray-500">Following</span>
          </div>
        </div>
      </div>

      {/* Posts Section */}
      {postsLoading ? (
        <>
          <PostSkeleton />
          <PostSkeleton />
          <PostSkeleton />
        </>
      ) : (
        data?.pages.map((page, pageIndex) =>
          page.data.map((post, idx) => (
            <PostCard
              key={post._id + "-" + pageIndex + "-" + idx}
              post={post}
              currentUser={currentUser}
            />
          ))
        )
      )}

      {isFetchingNextPage && <PostSkeleton />}

      {showModal && profile && (
        <EditProfileModal
          onClose={() => setShowModal(false)}
          onSave={(updatedData) => {
            queryClient.setQueryData(["userProfile", profile._id], updatedData);
            setShowModal(false);
          }}
          initialData={profile}
        />
      )}
    </div>
  );
};
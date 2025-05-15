import React, { useEffect, useState } from "react";
import { Link, MapPin, MessagesSquare, Share2 } from "lucide-react";
import { APIS } from "../../../config/Config";
import { getTimeAgo } from "../../ReUsables/GetTimeAgo";
import MediaGrid from "./MediaGrid";
import { NavLink } from "react-router-dom";
import { PostOptions } from "../post/PostOption";
import { NewPost } from "../NewPost";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import ShareModal from "../models/ShareModal";

const PostCard = (props) => {
  const queryClient = useQueryClient();

  const postId = props.postId;

  const [post, setPost] = useState({});
  // console.log("user in  post card:", props.currentUser)

  // const [agreeOwner, setAgreeOwner] = useState("");
  const agreeOwner = props.currentUser?._id;

  const [agrees, setAgrees] = useState([]);
  const [disagrees, setDisagrees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [openPostModal, setOpenPostModal] = useState(false);
  const [editData, setEditData] = useState(null);
  const [isFollowing, setIsFollowing] = useState(
    props.post?.owner?.followers?.includes(props.currentUser?._id) || false
  );
  // Inside your PostCard component, add this state:
  const [showShareModal, setShowShareModal] = useState(false);

  const { mutate: deletePost } = useMutation({
    mutationFn: (postId) => APIS.delPost(postId),
    onSuccess: () => {
      queryClient.invalidateQueries(["posts"]);
    },
  });

  const postFromprop = () => {
    setPost(props.post);
    setAgrees(props.post.likes || []);
    setDisagrees(props.post.disLikes || []);
  };

  useEffect(() => {
    postFromprop();
  }, [props.post]);

  useEffect(() => {}, [agrees, disagrees]);

  const handleAgree = async () => {
    if (agrees.some((agree) => agree.owner === agreeOwner)) {
      await APIS.unLike(post._id);
      setAgrees((prevAgrees) =>
        prevAgrees.filter((agree) => agree.owner !== agreeOwner)
      );
    } else {
      await APIS.like(post._id);
      setAgrees((prevAgrees) => [
        ...prevAgrees,
        { owner: agreeOwner, for_post: post._id },
      ]);

      setDisagrees((prevDisagrees) => {
        if (prevDisagrees.some((disagree) => disagree.owner === agreeOwner)) {
          APIS.unDisLike(post._id);
          return prevDisagrees.filter(
            (disagree) => disagree.owner !== agreeOwner
          );
        }
        return prevDisagrees;
      });
    }
  };

  const handleDisagree = async () => {
    if (disagrees.some((disagree) => disagree.owner === agreeOwner)) {
      await APIS.unDisLike(post._id);
      setDisagrees((prevDisagrees) =>
        prevDisagrees.filter((disagree) => disagree.owner !== agreeOwner)
      );
    } else {
      await APIS.disLike(post._id);
      setDisagrees((prevDisagrees) => [
        ...prevDisagrees,
        { owner: agreeOwner, for_post: post._id },
      ]);

      setAgrees((prevAgrees) => {
        if (prevAgrees.some((agree) => agree.owner === agreeOwner)) {
          APIS.unLike(post._id);
          return prevAgrees.filter((agree) => agree.owner !== agreeOwner);
        }
        return prevAgrees;
      });
    }
  };

  const handlePostDel = (postId) => {
    deletePost(postId);
  };

  // Update isFollowing state when props.post changes
  useEffect(() => {
    setIsFollowing(
      props.post?.owner?.followers?.includes(props.currentUser?._id) || false
    );
  }, [props.post]);

  const followMutation = useMutation({
    mutationFn: async ({ followerId, followId }) =>
      await APIS.followUser(followerId, followId),

    onMutate: async () => {
      await queryClient.cancelQueries(["userProfile", post.owner?._id]);
      await queryClient.cancelQueries(["userProfile", props.currentUser?._id]);

      const prevOwnerData = queryClient.getQueryData([
        "userProfile",
        post.owner?._id,
      ]);
      const prevCurrentUserData = queryClient.getQueryData([
        "userProfile",
        props.currentUser?._id,
      ]);

      // Optimistically update post owner (i.e., being followed)
      queryClient.setQueryData(["userProfile", post.owner?._id], (old) => ({
        ...old,
        followers: [...(old?.followers || []), props.currentUser?._id],
      }));

      // Optimistically update current user (i.e., following someone new)
      queryClient.setQueryData(
        ["userProfile", props.currentUser?._id],
        (old) => ({
          ...old,
          following: [...(old?.following || []), post.owner?._id],
        })
      );

      return { prevOwnerData, prevCurrentUserData };
    },

    onError: (err, _, context) => {
      queryClient.setQueryData(
        ["userProfile", post.owner?._id],
        context.prevOwnerData
      );
      queryClient.setQueryData(
        ["userProfile", props.currentUser?._id],
        context.prevCurrentUserData
      );
    },

    onSuccess: () => {
      queryClient.invalidateQueries(["userProfile", post.owner?._id]);
      queryClient.invalidateQueries(["userProfile", props.currentUser?._id]);
      queryClient.invalidateQueries(["userPosts"]);
    },
  });

  const unfollowMutation = useMutation({
    mutationFn: async ({ followerId, followId }) =>
      await APIS.unfollowUser(followerId, followId),

    onMutate: async () => {
      await queryClient.cancelQueries(["userProfile", post.owner?._id]);
      await queryClient.cancelQueries(["userProfile", props.currentUser?._id]);

      const prevOwnerData = queryClient.getQueryData([
        "userProfile",
        post.owner?._id,
      ]);
      const prevCurrentUserData = queryClient.getQueryData([
        "userProfile",
        props.currentUser?._id,
      ]);

      // Optimistically update post owner (remove current user from their followers)
      queryClient.setQueryData(["userProfile", post.owner?._id], (old) => ({
        ...old,
        followers:
          old?.followers?.filter((id) => id !== props.currentUser?._id) || [],
      }));

      // Optimistically update current user (remove followed user from their following)
      queryClient.setQueryData(
        ["userProfile", props.currentUser?._id],
        (old) => ({
          ...old,
          following:
            old?.following?.filter((id) => id !== post.owner?._id) || [],
        })
      );

      return { prevOwnerData, prevCurrentUserData };
    },

    onError: (err, _, context) => {
      queryClient.setQueryData(
        ["userProfile", post.owner?._id],
        context.prevOwnerData
      );
      queryClient.setQueryData(
        ["userProfile", props.currentUser?._id],
        context.prevCurrentUserData
      );
    },

    onSuccess: () => {
      queryClient.invalidateQueries(["userProfile", post.owner?._id]);
      queryClient.invalidateQueries(["userProfile", props.currentUser?._id]);
    },
  });

  const handleFollowAction = (followId) => {
    if (isFollowing) {
      unfollowMutation.mutate({
        followerId: props.currentUser?._id,
        followId,
      });
    } else {
      followMutation.mutate({
        followerId: props.currentUser?._id,
        followId,
      });
    }
  };

  return (
    <>
      {post ? (
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm w-full lg:max-w-[50rem] p-5">
          {/* Header */}
          <div className="flex justify-between items-start gap-4">
            {/* Profile & Info */}
            <NavLink
              to={`/profile/${post?.owner?.user_name}`}
              state={{ owner: post?.owner, currentUser: props.currentUser }}
              className="flex items-center gap-3"
            >
              <img
                src={post?.owner?.image}
                alt="profile"
                className="w-12 h-12 rounded-full border-2 border-blue-500"
              />
              <div>
                <p className="font-semibold text-sm text-gray-900">
                  {post?.owner?.user_name}
                </p>
                <span className="text-xs text-gray-500">
                  {getTimeAgo(post.createdAt)}
                </span>
              </div>
            </NavLink>

            {/* Actions: Follow or Post Options */}
            <div className="flex items-center gap-2">
              <NavLink to={`/dashboard/${post._id}`} className="">Analytics</NavLink>
              {agreeOwner !== post.owner?._id ? (
                <button
                  className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all duration-200 group ${
                    isFollowing
                      ? "bg-gray-100 hover:bg-red-50 text-gray-800 border border-gray-300 hover:border-red-300"
                      : "bg-blue-500 hover:bg-blue-600 text-white"
                  }`}
                  onClick={() => handleFollowAction(post.owner?._id)}
                >
                  <span
                    className={`${isFollowing ? "group-hover:hidden" : ""}`}
                  >
                    {isFollowing ? "Following" : "Follow"}
                  </span>
                  {isFollowing && (
                    <span className="hidden group-hover:block text-red-500">
                      Unfollow
                    </span>
                  )}
                </button>
              ) : (
                <PostOptions
                  onDelete={() => handlePostDel(post._id)}
                  onEdit={() => {
                    setEditData(post);
                    setOpenPostModal(true);
                  }}
                />
              )}
            </div>
          </div>

          {/* Location */}
          <div className="bg-gray-100 text-blue-600 text-sm font-medium rounded-md flex items-center justify-center mt-4 px-3 py-1.5 hover:underline cursor-pointer">
            <MapPin size={16} className="mr-1 text-blue-500" />
            <a
              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                post.location
              )}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              {post.location}
            </a>
          </div>

          {/* Description */}
          <p className="text-gray-800 text-sm mt-4">{post.description}</p>

          {/* Media */}
          {post.media && <MediaGrid media={post.media} />}

          {/* Actions */}
          <div className="border-t mt-4 pt-3 flex items-center justify-between text-sm text-gray-600">
            <div className="flex items-center w-full justify-between gap-4">
              <button onClick={handleAgree} className="flex items-center gap-1">
                <span
                  className={`font-medium text-base transition-colors ${
                    agrees.some((agree) => agree.owner === agreeOwner)
                      ? "text-blue-500"
                      : "text-gray-500"
                  }`}
                >
                  {agrees.some((agree) => agree.owner === agreeOwner)
                    ? "Agreed"
                    : "Agree"}
                </span>
                <span className="text-base font-medium">({agrees.length})</span>
              </button>

              <button
                onClick={handleDisagree}
                className="flex items-center gap-1"
              >
                <span
                  className={`font-medium text-base transition-colors ${
                    disagrees.some((disagree) => disagree.owner === agreeOwner)
                      ? "text-red-500"
                      : "text-gray-500"
                  }`}
                >
                  {disagrees.some((disagree) => disagree.owner === agreeOwner)
                    ? "Disagreed"
                    : "Disagree"}
                </span>
                <span className="text-base font-medium">
                  ({disagrees.length})
                </span>
              </button>
            
              <NavLink
                to={`/post/${post._id}`}
                state={{ post, currentUser: props.currentUser }}
                className="flex items-center gap-2 hover:text-gray-800"
              >
                <MessagesSquare size={20} />
                <span className="hidden md:inline font-medium">Comment</span>
              </NavLink>

              <button
                onClick={() => setShowShareModal(true)}
                className="flex items-center gap-2 hover:text-green-500"
              >
                <Share2 size={20} />
                <span className="hidden md:inline font-medium">Share</span>
              </button>
            </div>
          </div>
        </div>
      ) : (
        <>Error Fetching post</>
      )}
      <NewPost
        isOpen={openPostModal}
        onClose={() => setOpenPostModal(false)}
        editPostData={editData}
      />
      {showShareModal && (
        <ShareModal post={post} onClose={() => setShowShareModal(false)} />
      )}
    </>
  );
};

export default PostCard;

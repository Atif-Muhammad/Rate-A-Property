import React, { useEffect, useState } from "react";
import { MapPin, MessagesSquare, Share2 } from "lucide-react";
import { APIS } from "../../../config/Config";
import { getTimeAgo } from "../../ReUsables/GetTimeAgo";
import MediaGrid from "./MediaGrid";
import { NavLink } from "react-router-dom";
import { PostOptions } from "../post/PostOption";
import { NewPost } from "../NewPost";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import ShareModal from "../models/ShareModal";

const PostCard = (props) => {
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

  const queryClient = useQueryClient();

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

  const { mutate: followUser } = useMutation({
    mutationFn: (followId) => APIS.followUser(agreeOwner, followId),
    onMutate: (followId) => {
      // Optimistically update the UI
      setIsFollowing(true);
      return { previousFollowState: isFollowing };
    },
    onError: (err, followId, context) => {
      // Rollback on error
      setIsFollowing(context.previousFollowState);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["posts"]);
      queryClient.invalidateQueries(["userProfile", agreeOwner]);
    },
  });

  const { mutate: unfollowUser } = useMutation({
    mutationFn: (followId) => APIS.unfollowUser(agreeOwner, followId),
    onMutate: (followId) => {
      // Optimistically update the UI
      setIsFollowing(false);
      return { previousFollowState: isFollowing };
    },
    onError: (err, followId, context) => {
      // Rollback on error
      setIsFollowing(context.previousFollowState);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["posts"]);
      queryClient.invalidateQueries(["userProfile", agreeOwner]);
    },
  });

  const handleFollowAction = (followId) => {
    if (isFollowing) {
      unfollowUser(followId);
    } else {
      followUser(followId);
    }
  };

  return (
    <>
      {post ? (
        <div className="bg-white shadow-md rounded-lg p-3.5  w-full lg:max-w-3xl border border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center justify-between w-full space-x-3">
              {/* Profile & Username */}
              <NavLink
                to={`/profile/${post?.owner?.user_name}`}
                state={{ owner: post?.owner, currentUser: props.currentUser }}
                className="flex items-center gap-x-3"
              >
                <img
                  src={post?.owner?.image}
                  alt="profile"
                  className="w-12 h-12 rounded-full border-2 border-blue-500"
                />
                <div className="leading-tight">
                  <p className="text-sm font-semibold text-black">
                    {post?.owner?.user_name}
                  </p>
                  <span className="text-xs text-gray-500">
                    {getTimeAgo(post.createdAt)}
                  </span>
                </div>
              </NavLink>

              {/* Follow & PostOptions (right side) */}
              <div className="flex items-center gap-x-2">
                {/* Follow/Following Button with Unfollow on hover */}
                {agreeOwner != post.owner?._id && (
                  <button
                    className={`text-sm font-medium px-4 py-1.5 rounded-lg transition-all duration-200 active:scale-95 relative group ${
                      isFollowing
                        ? "bg-gray-100 hover:bg-red-50 text-black border border-gray-300 hover:border-red-300"
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
                )}

                {/* Post Options (if owner) */}
                {agreeOwner == post.owner?._id && (
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
          </div>

          {/* Location Section - Moved Up */}
          <div className="bg-gray-100 lg:text-sm md:text-sm text-[0.9rem] font-semibold text-blue-600 flex items-center  tracking-wide justify-center lg:px-5 md:px-3 px-2 py-2 mt-2 rounded-md hover:underline cursor-pointer">
            <MapPin size={16} className="text-blue-500 mr-1" />
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

          {/* Post Content */}
          <p className="text-gray-800 text-sm mt-2">{post.description}</p>

          {post.media && <MediaGrid media={post.media} />}
          {/* Action Buttons */}
          <div className="flex justify-between gap-2 p-2 border-t border-gray-300 pt-3 items-center  text-gray-600 text-sm">
            <div className="flex items-center gap-x-4">
              <button
                onClick={handleAgree}
                className="flex items-center gap-x-1"
              >
                <span
                  className={`cursor-pointer transition-colors text-base font-medium ${
                    agrees.some((agree) => agree.owner === agreeOwner)
                      ? "text-blue-500"
                      : "text-gray-500"
                  }`}
                >
                  Agree
                </span>
                <span className="text-base font-medium">({agrees.length})</span>
              </button>

              <button
                onClick={handleDisagree}
                className="flex items-center gap-x-1"
              >
                <span
                  className={`cursor-pointer transition-colors text-base font-medium ${
                    disagrees.some((disagree) => disagree.owner === agreeOwner)
                      ? "text-red-500"
                      : "text-gray-500"
                  }`}
                >
                  Disagree
                </span>
                <span className="text-base font-medium">
                  ({disagrees.length})
                </span>
              </button>
            </div>

            <NavLink
              to={`/post/${post._id}`}
              state={{ post, currentUser: props.currentUser }}
              className="flex items-center md:gap-x-2 hover:text-gray-700 transition"
            >
              <MessagesSquare size={22} />
              <span className="text-base hidden md:flex font-medium">
                Comment
              </span>
            </NavLink>

            {/* <button className="flex items-center md:gap-x-2 hover:text-green-500 transition">
              <Share2 size={22} />
              <span className="text-base font-medium hidden md:flex">
                Share
              </span>
            </button> */}

            <button
              className="flex items-center md:gap-x-2 hover:text-green-500 transition"
              onClick={() => setShowShareModal(true)}
            >
              <Share2 size={22} />
              <span className="text-base font-medium hidden md:flex">
                Share
              </span>
            </button>
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

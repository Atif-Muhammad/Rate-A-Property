import React, { useEffect, useState } from "react";
import { MapPin, MessagesSquare, Share2 } from "lucide-react";
import { APIS } from "../../../config/Config";
import { getTimeAgo } from "../../ReUsables/GetTimeAgo";
import MediaGrid from "./MediaGrid";
import { NavLink } from "react-router-dom";
import { PostOptions } from "../post/PostOption";
import { arrayBufferToBase64 } from "../../ReUsables/arrayTobuffer";
import PostSkeleton from "../skeletons/PostSkeleton";
import DiscoverSkeleton from "../skeletons/DiscoverSkeleton";
import { NewPost } from "../NewPost";
import { useMutation, useQueryClient } from "@tanstack/react-query";

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

  const queryClient = useQueryClient();

  const { mutate: deletePost } = useMutation({
    mutationFn: (postId) => APIS.delPost(postId),
    onSuccess: (_, postId) => {
      queryClient.invalidateQueries(["posts"]);
    },
    onError: (error) => {
      console.error("Error deleting post:", error);
    },
  });

  const postFromprop = () => {
    setPost(props.post);
    setAgrees(props.post.likes || []);
    setDisagrees(props.post.disLikes || []);
  };

  useEffect(() => {
    postFromprop();
  }, [props.post]); // This will update when parent updates the post prop

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

  const handleFollow = async (followId) => {
    try {
      const response = await APIS.followUser(agreeOwner, followId);
      if (response.status === 200) {
        console.log("Followed successfully");
        // Optionally, you can update the UI or state here
      } else {
        console.error("Failed to follow user:", response.data);
      }
    } catch (error) {
      console.error("Error following user:", error);
    }
  }

  return (
    <>
      {post ? (
        <div className="bg-white shadow-md rounded-lg p-3.5  w-full lg:max-w-3xl border border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center justify-between w-full space-x-3">
              {/* change this */}
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
                  <div className="flex items-center gap-x-5">
                    <p className="text-sm font-semibold text-black">
                      {post?.owner?.user_name}
                    </p>
                    {(agreeOwner != post.owner?._id && !post.owner?.followers?.includes(agreeOwner)) && <button className="text-xs border px-2 py-0.5 cursor-pointer" onClick={()=> handleFollow(post.owner?._id)}>Follow</button>}
                  </div>
                  <span className="text-xs text-gray-500">
                    {getTimeAgo(post.createdAt)}
                  </span>
                </div>
              </NavLink>
              {agreeOwner == post.owner?._id && (
                <PostOptions
                  onDelete={() => {
                    handlePostDel(post._id);
                  }}
                  onEdit={() => {
                    setEditData(post); // ← set post to edit in parent
                    setOpenPostModal(true); // ← open modal
                  }}
                />
              )}
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
          <div className="flex justify-between gap-2 p-2 border-t border-gray-300 pt-3 items-center mt-4 text-gray-600 text-sm">
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

            <button className="flex items-center md:gap-x-2 hover:text-green-500 transition">
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
    </>
  );
};

export default PostCard;

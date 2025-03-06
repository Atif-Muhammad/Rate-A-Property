import React, { useEffect, useState } from "react";
import {
  MoreHorizontal,
  MapPin,
  MessagesSquare,
  Share2,
  ThumbsUp,
  ThumbsDown,
} from "lucide-react";
import { APIS } from "../../../config/Config";
import { getTimeAgo } from "../../ReUsables/GetTimeAgo";

const PostCard = ({ post }) => {
  const [agreeOwner, setAgreeOwner] = useState(""); // User ID
  const [agrees, setAgrees] = useState(post.likes);
  const [disagrees, setDisagrees] = useState(post.disLikes);

  useEffect(() => {
    APIS.userWho()
      .then((res) => setAgreeOwner(res.data.id))
      .catch((err) => console.log(err));
  }, []);

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

      // Remove Disagree if exists
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

      // Remove Agree if exists
      setAgrees((prevAgrees) => {
        if (prevAgrees.some((agree) => agree.owner === agreeOwner)) {
          APIS.unLike(post._id);
          return prevAgrees.filter((agree) => agree.owner !== agreeOwner);
        }
        return prevAgrees;
      });
    }
  };

  return (
    <div className="bg-white shadow-md rounded-lg p-4 w-full max-w-2xl border border-gray-200">
      {/* Profile & Post Info */}
      <div className="flex items-center justify-between">
        <div className="flex items-center justify-between w-full space-x-3 ">
          <div className="flex items-center gap-x-3">
            <img
              src={`data:${post.owner.image.contentType};base64,${btoa(
                String.fromCharCode(
                  ...new Uint8Array(post.owner.image.data.data)
                )
              )}`}
              alt="profile"
              className="w-12 h-12 rounded-full border-2 border-blue-500"
            />

            <div className="leading-tight">
              <p className="text-sm font-semibold">{post.owner.user_name}</p>
              <span className="text-xs text-gray-500">
                {getTimeAgo(post.createdAt)}
              </span>
            </div>
          </div>

          <div className="flex items-center text-xs text-gray-500 gap-x-2">
            <MoreHorizontal
              size={22}
              className="text-gray-500 cursor-pointer"
            />
          </div>
        </div>
      </div>
      <div>
        <span className="text-sm py-3 flex text-gray-500">
          <MapPin size={14} />
          <span>{post.location}</span>
        </span>

        {/* Post Content */}
        <p className=" text-gray-800 text-base">{post.description}</p>
      </div>

      {/* Post Image (If Exists) */}
      {post.image && (
        <div className="mt-3">
          <img
            src={post.image}
            alt="Post"
            className="rounded-lg w-full object-cover max-h-72"
          />
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex justify-between gap-2 p-2 border-t border-gray-300 pt-3 items-center mt-4 text-gray-600 text-sm">
        <div className="flex items-center gap-x-2">
          <div className="flex items-center justify-center gap-x-1">
            <button onClick={handleAgree}>
              <ThumbsUp
                size={32}
                className={`transition-transform ${
                  agrees.some((agree) => agree.owner === agreeOwner)
                    ? "text-green-700"
                    : "text-gray-500"
                }`}
              />
            </button>
            <span className="text-base font-medium">{agrees.length}</span>
          </div>
          <div className="flex items-center justify-center gap-x-1">
            <button onClick={handleDisagree}>
              <ThumbsDown
                size={32}
                className={`transition-transform ${
                  disagrees.some((disagree) => disagree.owner === agreeOwner)
                    ? "text-red-500"
                    : "text-gray-500"
                }`}
              />
            </button>
            <span className="text-base font-medium">{disagrees.length}</span>
          </div>
        </div>

        <button className="flex items-center md:gap-x-2 hover:text-gray-700 transition">
          <MessagesSquare size={22} />
          <span className="text-base hidden md:flex font-medium">Comment</span>
        </button>

        <button className="flex items-center md:gap-x-2 hover:text-green-500 transition">
          <Share2 size={22} />
          <span className="text-base font-medium hidden md:flex">Share</span>
        </button>
      </div>
    </div>
  );
};

export default PostCard;

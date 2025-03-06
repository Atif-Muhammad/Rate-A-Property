import React, { useEffect, useState } from "react";
import {
  MoreHorizontal,
  MapPin,
  MessagesSquare,
  Share2,
  ArrowBigUp,
  ArrowBigDown,
} from "lucide-react";
import { APIS } from "../../../config/Config";
import { getTimeAgo } from "../../ReUsables/GetTimeAgo";

const PostCard = ({ post }) => {
  const [likeOwner, setLikeOwner] = useState(""); // User ID
  const [likes, setLikes] = useState(post.likes);
  const [disLikes, setDisLikes] = useState(post.disLikes);

  useEffect(() => {
    APIS.userWho()
      .then((res) => setLikeOwner(res.data.id))
      .catch((err) => console.log(err));
  }, []);

  const handleLike = async () => {
    if (likes.some((like) => like.owner === likeOwner)) {
      await APIS.unLike(post._id);
      setLikes((prevLikes) =>
        prevLikes.filter((like) => like.owner !== likeOwner)
      );
    } else {
      await APIS.like(post._id);
      setLikes((prevLikes) => [
        ...prevLikes,
        { owner: likeOwner, for_post: post._id },
      ]);

      // Remove Dislike if exists
      setDisLikes((prevDisLikes) => {
        if (prevDisLikes.some((dislike) => dislike.owner === likeOwner)) {
          APIS.unDisLike(post._id);
          return prevDisLikes.filter((dislike) => dislike.owner !== likeOwner);
        }
        return prevDisLikes;
      });
    }
  };

  const handleDisLike = async () => {
    if (disLikes.some((dislike) => dislike.owner === likeOwner)) {
      await APIS.unDisLike(post._id);
      setDisLikes((prevDisLikes) =>
        prevDisLikes.filter((dislike) => dislike.owner !== likeOwner)
      );
    } else {
      await APIS.disLike(post._id);
      setDisLikes((prevDisLikes) => [
        ...prevDisLikes,
        { owner: likeOwner, for_post: post._id },
      ]);

      // Remove Like if exists
      setLikes((prevLikes) => {
        if (prevLikes.some((like) => like.owner === likeOwner)) {
          APIS.unLike(post._id);
          return prevLikes.filter((like) => like.owner !== likeOwner);
        }
        return prevLikes;
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
            {/* <MapPin size={14} /> <span>{post.location}</span> */}
            <MoreHorizontal
              size={22}
              className="text-gray-500 cursor-pointer"
            />
          </div>
        </div>
      </div>
      <div>
        <span className="text-xs py-3 flex text-gray-500">
          <MapPin size={14} /> <span>{post.location}</span>
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
            <button onClick={handleLike}>
              <ArrowBigUp
                size={32}
                className={`transition-transform ${
                  likes.some((like) => like.owner === likeOwner)
                    ? "translate-y-[-2px] scale-110 fill-green-700 stroke-0"
                    : ""
                }`}
              />
            </button>
            <span className="text-base font-medium">{post.likes.length}</span>
          </div>
          <div className="flex items-center justify-center gap-x-1">
            <button onClick={handleDisLike}>
              <ArrowBigDown
                size={32}
                className={`transition-transform ${
                  disLikes.some((like) => like.owner === likeOwner)
                    ? "translate-y-[2px] scale-110 fill-red-500 stroke-0"
                    : ""
                }`}
              />
            </button>
            <span className="text-base font-medium">
              {post.disLikes.length}
            </span>
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

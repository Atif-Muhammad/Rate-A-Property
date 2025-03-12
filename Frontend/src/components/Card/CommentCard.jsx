import React, { useEffect, useState } from "react";
import { arrayBufferToBase64 } from "../../ReUsables/arrayTobuffer";
import {
  ThumbsUp,
  ThumbsDown,
  MessageCircle,
  MoreHorizontal,
} from "lucide-react";
import { APIS } from "../../../config/Config";
import { getTimeAgo } from "../../ReUsables/GetTimeAgo";

function CommentCard(props) {
  const [agrees, setAgrees] = useState(props.comment.likes);
  const [disagrees, setDisagrees] = useState(props.comment.disLikes);
  const agreeOwner = props.agreeOwner;
  const isTemp = props.comment._id.startsWith("temp");

  useEffect(() => {
    // console.log(props.comment)
    setAgrees(props.comment.likes);
    setDisagrees(props.comment.disLikes);
  }, [props.comment.likes, props.comment.disLikes]);

  const handleAgree = async () => {
    if (isTemp) return;

    if (agrees.some((like) => like.owner === agreeOwner)) {
      await APIS.unLikeComment(props.comment._id);
      setAgrees((prev) => prev.filter((like) => like.owner !== agreeOwner));
    } else {
      await APIS.likeComment(props.comment._id);
      setAgrees((prev) => [
        ...prev,
        { owner: agreeOwner, for_post: props.comment._id },
      ]);
      setDisagrees((prev) =>
        prev.filter((dislike) => dislike.owner !== agreeOwner)
      );
    }
  };

  const handleDisagree = async () => {
    if (isTemp) return;

    if (disagrees.some((dislike) => dislike.owner === agreeOwner)) {
      await APIS.unDisLikeComment(props.comment._id);
      setDisagrees((prev) =>
        prev.filter((dislike) => dislike.owner !== agreeOwner)
      );
    } else {
      await APIS.disLikeComment(props.comment._id);
      setDisagrees((prev) => [
        ...prev,
        { owner: agreeOwner, for_post: props.comment._id },
      ]);
      setAgrees((prev) => prev.filter((like) => like.owner !== agreeOwner));
    }
  };

  return (
    <div
      className={`relative flex items-start space-x-3 p-4 rounded-lg shadow-sm transition ${
        isTemp ? "bg-gray-500" : "bg-gray-100"
      }`}
    >
      {/* User Avatar */}
      <img
        src={`data:${
          props.comment.owner?.image?.contentType
        };base64,${arrayBufferToBase64(
          props.comment.owner?.image?.data?.data
        )}`}
        alt="avatar"
        className="w-12 h-12 rounded-full"
      />

      <div className="flex-1">
        {/* User Info */}
        <div className="flex items-center space-x-2">
          <span className="font-semibold text-gray-900">
            {props.comment.owner?.user_name}
          </span>
          <span className="text-xs text-gray-500">
            {getTimeAgo(props.comment.createdAt)}
          </span>
        </div>

        {/* Comment Text */}
        <p className="text-gray-800 mt-1">{props.comment.comment}</p>

        {/* Comment Media (Images) */}
        {props.comment.media && props.comment.media.length > 0 && (
          <div className="grid grid-cols-2 gap-2 mt-2">
            {props.comment.media?.map((media, index) => (
              <img
                key={index}
                src={`data:${media.contentType};base64,${arrayBufferToBase64(
                  media.data?.data
                )}`}
                alt="comment-media"
                className="rounded-lg w-full h-32 object-cover"
              />
            ))}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex space-x-4 text-sm text-gray-500 mt-2">
          <button
            onClick={handleAgree}
            className="flex items-center space-x-1 hover:text-blue-600"
          >
            <ThumbsUp size={16} /> <span>({agrees?.length || 0})</span>
          </button>
          <button
            onClick={handleDisagree}
            className="flex items-center space-x-1 hover:text-red-600"
          >
            <ThumbsDown size={16} /> <span>({disagrees?.length || 0})</span>
          </button>
          <button className="flex items-center space-x-1 hover:text-blue-600">
            <MessageCircle size={16} /> <span>Reply</span>
          </button>
        </div>
      </div>

      {/* More Options */}
      <button className="absolute top-2 right-2 text-gray-500 hover:text-gray-700">
        <MoreHorizontal size={20} />
      </button>
    </div>
  );
}

export default CommentCard;

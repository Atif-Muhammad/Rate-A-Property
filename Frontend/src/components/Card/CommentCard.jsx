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
      className={`flex items-start space-x-3 p-4  rounded-lg shadow-sm transition ${
        isTemp ? "bg-gray-500" : "bg-gray-100"
      }`}
    >
      <img
        src={`data:${
          props.comment.owner.image?.contentType
        };base64,${arrayBufferToBase64(props.comment.owner.image?.data?.data)}`}
        alt="avatar"
        className="w-12 h-12 rounded-full"
      />
      <div className="flex-1">
        <div className="flex items-center space-x-2">
          <span className="font-semibold text-gray-900">
            {props.comment.owner.user_name}
          </span>
          <span className="text-xs text-gray-500">
            {getTimeAgo(props.comment.createdAt)}
          </span>
        </div>
        <p className="text-gray-800 mt-1">{props.comment.comment}</p>
        <div className="flex space-x-4 text-sm text-gray-500 mt-2">
          <button
            // className={`flex items-center space-x-1 ${
            //   agreeOwner == props.comment.owner._id
            //     ? "text-blue-600"
            //     : "hover:text-blue-600 text-gray-300"
            // }`}
            onClick={handleAgree}
          >
            <ThumbsUp size={16} /> <span>Like ({agrees?.length || 0})</span>
          </button>
          <button
            // className={`flex items-center space-x-1 ${
            //   agreeOwner == props.comment.owner._id
            //     ? "text-red-600"
            //     : "hover:text-red-600"
            // }`}
            onClick={handleDisagree}
          >
            <ThumbsDown size={16} />{" "}
            <span>Dislike ({disagrees?.length || 0})</span>
          </button>
          <button className="flex items-center space-x-1 hover:text-blue-600">
            <MessageCircle size={16} /> <span>Reply</span>
          </button>
        </div>
      </div>
      <button className="absolute top-2 right-2 text-gray-500 hover:text-gray-700">
        <MoreHorizontal size={20} />
      </button>
    </div>
  );
}

export default CommentCard;

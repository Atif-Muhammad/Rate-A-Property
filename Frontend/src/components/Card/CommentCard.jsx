import React, { useState, useEffect } from "react";
import { arrayBufferToBase64 } from "../../ReUsables/arrayTobuffer";
import {
  ThumbsUp,
  ThumbsDown,
  MessageCircle,
  MoreHorizontal,
} from "lucide-react";
import { APIS } from "../../../config/Config";
import { getTimeAgo } from "../../ReUsables/GetTimeAgo";
import MediaGrid from "./MediaGrid";
import { CommentInputBox } from "./CommentInputBox";

function CommentCard(props) {
  const [agrees, setAgrees] = useState(props.comment.likes);
  const [disagrees, setDisagrees] = useState(props.comment.disLikes);
  const agreeOwner = props.agreeOwner;
  const isTemp = props.comment._id.startsWith("temp");
  const [isExpanded, setIsExpanded] = useState(false);
  const [showReplyBox, setShowReplyBox] = useState(false);
  const [replies, setReplies] = useState(props.comment.replies || []);

  const MAX_LENGTH = 200;

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

  const handleSendReply = (text, media) => {
    const newReply = {
      _id: "temp_" + Date.now(),
      owner: props.currentUser,
      comment: text,
      media: media || [],
      likes: [],
      disLikes: [],
      createdAt: new Date().toISOString(),
      replies: [],
    };
    setReplies((prev) => [...prev, newReply]);
    setShowReplyBox(false);
  };

  return (
    <div
      className={`relative flex flex-col items-start space-y-2 p-4 rounded-lg shadow-sm transition ${
        isTemp ? "bg-gray-500" : "bg-gray-100"
      }`}
    >
      <div className="flex items-start space-x-3 w-full">
        {/* User Avatar */}
        {props.comment.owner?.image?.contentType ? (
          <img
            className="w-12 h-12 rounded-full"
            src={`data:${
              props.comment.owner?.image.contentType
            };base64,${arrayBufferToBase64(
              props.comment.owner?.image.data?.data
            )}`}
            alt="user profile"
          />
        ) : (
          <img
            src={props.comment.owner?.image}
            alt="avatar"
            className="w-12 h-12 rounded-full"
          />
        )}

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
          <p className="text-gray-800 mt-1 break-all">
            {isExpanded || props.comment.comment.length <= MAX_LENGTH
              ? props.comment.comment
              : `${props.comment.comment.slice(0, MAX_LENGTH)}... `}
            {props.comment.comment.length > MAX_LENGTH && (
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="text-blue-600 ms-2 cursor-pointer"
              >
                {isExpanded ? "Show Less" : "Read More"}
              </button>
            )}
          </p>

          {/* Media */}
          {props.comment.media && props.comment.media.length > 0 && (
            <MediaGrid media={props.comment.media} />
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
            <button
              onClick={() => setShowReplyBox(!showReplyBox)}
              className="flex items-center space-x-1 hover:text-blue-600"
            >
              <MessageCircle size={16} /> <span>Reply</span>
            </button>
          </div>
        </div>

        {/* More Options */}
        <button className="absolute top-2 right-2 text-gray-500 hover:text-gray-700">
          <MoreHorizontal size={20} />
        </button>
      </div>

      {/* Nested Reply Input */}
      {showReplyBox && (
        <CommentInputBox
          currentUser={props.currentUser}
          onSendReply={handleSendReply}
          onCancel={() => setShowReplyBox(false)}
        />
      )}

      {/* Replies */}
      {replies.length > 0 && (
        <div className="w-full space-y-3 mt-4 pl-8 border-l-2 border-b-2  rounded-b-lg border-gray-300">
          {replies.map((reply) => (
            <CommentCard
              key={reply._id}
              comment={reply}
              agreeOwner={props.agreeOwner}
              currentUser={props.currentUser}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default CommentCard;

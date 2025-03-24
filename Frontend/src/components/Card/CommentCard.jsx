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
import MediaGrid from "../post/MediaGrid";
import { CommentInputBox } from "./CommentInputBox";
import { CommentOptions } from "./CommentOption";

function CommentCard(props) {
  const [agrees, setAgrees] = useState(props.comment.likes);
  const [disagrees, setDisagrees] = useState(props.comment.disLikes);
  const agreeOwner = props.agreeOwner;
  const isTemp = props.comment?._id?.startsWith("temp");
  const [isExpanded, setIsExpanded] = useState(false);
  const [showReplyBox, setShowReplyBox] = useState(false);
  const [replies, setReplies] = useState(props.comment.comments || []);
  const [currentUser, setCurrentUser] = useState({});
  const [showReplies, setShowReplies] = useState(false);

  const MAX_LENGTH = 200;

  useEffect(() => {
    // console.log("comment:", props.comment)
    setAgrees(props.comment.likes);
    setDisagrees(props.comment.disLikes);
  }, [props.comment.likes, props.comment.disLikes]);

  const getReplies = async () => {
    await APIS.getReplies(props.comment._id)
      .then((res) => {
        if (res.status === 200) {
          setReplies(res.data);
        }
      })
      .catch((err) => {
        console.log(err);
      });
  };

  useEffect(() => {
    getReplies();
  }, []);

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

  const handleSendReply = async (text, media) => {
    if (!text.trim() && media.length === 0) return;
    const tempId = `temp-${Date.now()}`;

    const mediaPreviews = media.map((file) => {
      const fileExt = file.name.split(".").pop().toLowerCase();
      const mediaType = ["mp4", "webm", "mov"].includes(fileExt)
        ? "video"
        : "image";
      const url = URL.createObjectURL(file);

      return {
        _id: `temp-media-${Date.now()}`,
        filename: file.name,
        type: mediaType,
        url,
        likes: [],
        disLikes: [],
      };
    });

    const newReplyData = {
      _id: tempId,
      owner: {
        id: currentUser.id,
        user_name: currentUser.user_name,
        image: currentUser.image,
      },
      comment: text,
      for_post: props.comment._id,
      createdAt: new Date().toISOString(),
      likes: [],
      disLikes: [],
      media: mediaPreviews,
    };

    setReplies((prevReplies) => [newReplyData, ...prevReplies]);

    const formData = new FormData();
    formData.append("owner", currentUser.id);
    formData.append("content", text);
    formData.append("for_post", props.comment._id);

    media.forEach((file) => formData.append("files", file));

    // for (let [key, value] of formData.entries()) {
    //   console.log(`${key}:`, value);
    // }

    await APIS.addReply(formData)
      .then((res) => {
        if (res.status === 200) {
          setReplies((prevReplies) =>
            prevReplies.map((reply) =>
              reply._id === tempId ? res.data : reply
            )
          );
        }
      })
      .catch((err) => {
        console.log(err);
        setReplies((prevReplies) =>
          prevReplies.filter((reply) => reply._id !== tempId)
        );
      });
  };

  const getUserDetails = async () => {
    try {
      const res = await APIS.userWho();
      if (res.status === 200) {
        const userRes = await APIS.getUser(res.data.id);
        // console.log(userRes)
        if (userRes.status === 200) {
          const details = {
            owner: userRes.data.user_name,
            id: userRes.data._id,
            image: userRes.data.image,
            user_name: userRes.data.user_name,
            posts: userRes.data.posts || [],
          };
          setCurrentUser(details);
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    getUserDetails();
  }, []);

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
            {isExpanded || props.comment?.comment?.length <= MAX_LENGTH
              ? props.comment?.comment
              : `${props.comment?.comment?.slice(0, MAX_LENGTH)}... `}
            {props.comment?.comment?.length > MAX_LENGTH && (
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

        <CommentOptions
          onDelete={() => {
            console.log("delete post", post._id);
            // yahan aap delete ka API call ya modal laga sakte ho
          }}
          onEdit={() => {
            console.log("edit post", post._id);
            // yahan aap edit modal open karo ya edit page le jao
          }}
        />
      </div>

      {/* Replies */}
      {replies.length > 0 && (
        <div className="w-full mt-4 pl-8 relative">
          {!showReplies ? (
            <button
              onClick={() => setShowReplies(true)}
              className="text-blue-600 text-sm hover:underline"
            >
              View Replies ({replies.length})
            </button>
          ) : (
            <>
              <button
                onClick={() => setShowReplies(false)}
                className="text-blue-600 text-sm mb-2 hover:underline"
              >
                Hide Replies
              </button>
              {/* Vertical Line */}
              <div className="absolute top-0 left-4 h-full border-l-2 border-gray-300"></div>

              <div className="space-y-3 pl-6">
                {replies.map((reply) => (
                  <CommentCard
                    key={reply._id}
                    comment={reply}
                    agreeOwner={props.agreeOwner}
                    currentUser={props.currentUser}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {/* Nested Reply Input */}
      {showReplyBox && (
        <CommentInputBox
          currentUser={props.currentUser}
          onSendReply={handleSendReply}
          onCancel={() => setShowReplyBox(false)}
        />
      )}
    </div>
  );
}

export default CommentCard;

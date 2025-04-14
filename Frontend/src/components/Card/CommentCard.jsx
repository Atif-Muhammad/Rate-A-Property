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
import CommentSkeleton from "../skeletons/CommentSkeleton";
import {
  QueryClient,
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

function CommentCard(props) {
  const [agrees, setAgrees] = useState(props.comment.likes);
  const [disagrees, setDisagrees] = useState(props.comment.disLikes);
  const currentUser = props.currentUser;
  const agreeOwner = props.currentUser.id;
  // console.log(currentUser)
  const isTemp = props.comment?._id?.startsWith("temp");
  const [isExpanded, setIsExpanded] = useState(false);
  // const [showReplyBox, setShowReplyBox] = useState(false);
  const showReplyBox = props.activeReplyCommentId === props.comment._id;

  // const [replies, setReplies] = useState(props.comment.comments || []);

  // const [currentUser, setCurrentUser] = useState({});
  const [showReplies, setShowReplies] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(props.comment.comment);
  const [visibleReplyPages, setVisibleReplyPages] = useState(1);

  const MAX_LENGTH = 200;

  const queryClient = useQueryClient();

  const { mutate: deleteComment } = useMutation({
    mutationFn: async (commentId) => await APIS.delComment(commentId),

    // Optimistically update the UI before the request finishes
    onMutate: async (commentId) => {
      await queryClient.cancelQueries(["comments", props.comment?.for_post]);

      const previousData = queryClient.getQueryData([
        "comments",
        props.comment?.for_post,
      ]);

      queryClient.setQueryData(
        ["comments", props.comment?.for_post],
        (oldData) => {
          if (!oldData) return oldData;
          console.log(oldData);
          return {
            ...oldData,
            pages: oldData.pages.map((page) => ({
              ...page,
              comments: page.data?.filter(
                (comment) => comment._id !== commentId
              ),
            })),
          };
        }
      );

      return { previousData };
    },
    // Rollback if there's an error
    onError: (err, commentId, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(
          ["comments", props.comment?.for_post],
          context.previousData
        );
      }
      console.error("Error deleting comment:", err);
    },

    // Optionally refetch to ensure server-state consistency
    onSettled: () => {
      queryClient.invalidateQueries(["comments", props.comment?.for_post]);
    },
  });

  const {
    data: replies = [],
    isLoading: loadingReplies,
    fetchNextPage,
    hasNextPage,
    refetch: refetchReplies,
  } = useInfiniteQuery({
    queryKey: ["replies", props.comment._id],
    queryFn: async ({ pageParam = 1 }) => {
      const res = await APIS.getReplies({
        pageParam,
        commentId: props.comment._id,
      });
      // console.log(res.data)
      return {
        data: res.data,
        nextPage: pageParam + 1,
        hasMore: res.data.length === 5,
      };
    },
    getNextPageParam: (lastPage) =>
      lastPage.hasMore ? lastPage.nextPage : undefined,
    enabled: false,
  });

  const sendReplyMutation = useMutation({
    mutationFn: async ({ formData, tempId }) => {
      const res = await APIS.addReply(formData);
      return { reply: res.data, tempId };
    },
    onSuccess: ({ reply, tempId }) => {
      queryClient.setQueryData(["replies", props.comment._id], (old) => {
        if (!old) return old;
        return {
          ...old,
          pages: old.pages.map((page, idx) => {
            if (idx === 0) {
              return {
                ...page,
                data: page.data.map((r) => (r._id === tempId ? reply : r)),
              };
            }
            return page;
          }),
        };
      });
    },

    onError: (_err, { tempId }) => {
      queryClient.setQueryData(["replies", props.comment._id], (old) => {
        if (!old) return old;
        return {
          ...old,
          pages: old.pages.map((page, idx) => {
            if (idx === 0) {
              return {
                ...page,
                data: page.data.filter((reply) => reply._id !== tempId),
              };
            }
            return page;
          }),
        };
      });
    },
  });

  const handleEditComment = () => {
    setIsEditing(true);
    setEditText(props.comment.comment);
  };

  const handleSaveEdit = async () => {
    if (!editText.trim()) return;

    try {
      const res = await APIS.updateComment(props.comment._id, {
        content: editText,
      });
      if (res.status === 200) {
        setIsEditing(false);
        props.comment.comment = editText; // Update the UI
      }
    } catch (err) {
      console.error("Error updating comment:", err);
    }
  };

  useEffect(() => {
    // console.log("comment:", props.comment)
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
    if (!text.trim() && media.length === 0) return;

    console.log(text)
    console.log(media)
    console.log(props.comment._id)

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
        id: currentUser?.id,
        user_name: currentUser?.user_name,
        image: currentUser?.image,
      },
      comment: text,
      for_post: props.comment._id,
      createdAt: new Date().toISOString(),
      likes: [],
      disLikes: [],
      media: mediaPreviews,
    };

    // console.log(newReplyData)

    queryClient.setQueryData(["replies", props.comment._id], (old) => {
      if (!old) return;
      return {
        ...old,
        pages: [
          {
            ...old.pages[0],
            data: [newReplyData, ...old.pages[0].data],
          },
          ...old.pages.slice(1),
        ],
      };
    });

    setShowReplies(true);

    const formData = new FormData();
    formData.append("owner", currentUser?.id);
    formData.append("content", text);
    formData.append("for_post", props.comment._id);
    media.forEach((file) => formData.append("files", file));

    sendReplyMutation.mutate({ formData, tempId });
  };

  const handleCommentDel = async (commentId) => {
    deleteComment(commentId);
  };

  const totalPagesInCache = replies?.pages?.length || 0;
  const shouldShowLoadMore =
    visibleReplyPages < totalPagesInCache || hasNextPage;

  return (
    <>
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
                onClick={() =>
                  props.setActiveReplyCommentId(
                    showReplyBox ? null : props.comment?._id
                  )
                }
                className="flex items-center space-x-1 hover:text-blue-600"
              >
                <MessageCircle size={16} /> <span>Reply</span>
              </button>
            </div>
          </div>
          {currentUser.id == props.comment.owner?._id && (
            <CommentOptions
              onDelete={() => {
                handleCommentDel(props.comment._id);
              }}
              onEdit={handleEditComment}
            />
          )}
        </div>

        {/* Replies */}
        {props.comment.comments?.length > 0 && (
          <div className="w-full mt-4 pl-8 relative">
            {!showReplies ? (
              <button
                onClick={() => {
                  setVisibleReplyPages(1);
                  if (!showReplies) refetchReplies();
                  setShowReplies(true);
                }}
                className="text-blue-600 text-sm hover:underline cursor-pointer"
              >
                View Replies ({props.comment.comments?.length})
              </button>
            ) : (
              <>
                <button
                  onClick={() => setShowReplies(false)}
                  className="text-blue-600 text-sm mb-2 hover:underline cursor-pointer"
                >
                  Hide Replies
                </button>

                <div className="absolute top-0 left-4 h-full border-l-2 border-gray-300"></div>

                <div className="space-y-3 pl-6">
                  {shouldShowLoadMore && (
                    <div className="flex justify-start">
                      <button
                        onClick={() => {
                          if (hasNextPage) {
                            fetchNextPage().then(() =>
                              setVisibleReplyPages((prev) => prev + 1)
                            );
                          } else {
                            setVisibleReplyPages((prev) => prev + 1);
                          }
                        }}
                        className="text-sm text-blue-700 font-medium hover:underline px-2 py-1"
                        disabled={loadingReplies}
                      >
                        {loadingReplies ? "Loading..." : "Load More Replies"}
                      </button>
                    </div>
                  )}

                  {!loadingReplies ? (
                    replies?.pages
                      .slice(0, visibleReplyPages)
                      .flatMap((page) =>
                        page.data.map((reply) => (
                          <CommentCard
                            key={reply._id}
                            comment={reply}
                            agreeOwner={props.agreeOwner}
                            currentUser={props.currentUser}
                          />
                        ))
                      )
                  ) : (
                    <CommentSkeleton />
                  )}
                </div>
              </>
            )}
          </div>
        )}

        {(showReplyBox || isEditing) && (
          <CommentInputBox
            currentUser={props.currentUser}
            initialText={isEditing ? editText : ""}
            initialMedia={isEditing ? props.comment.media : []} // Pass existing media if it's being edited ||||| error because it is passing the post's images to the reply's input box, becaue you have used the same input box for them both.
            onSendReply={(text, media) => {
              if (isEditing) {
                setEditText(text);
                handleSaveEdit();
                setIsEditing(false);
              } else {
                handleSendReply(text, media);
              }
              props.setActiveReplyCommentId(null); // Close the input box
            }}
            onCancel={() => {
              props.setActiveReplyCommentId(null);
              setIsEditing(false);
            }}
          />
        )}
      </div>
    </>
  );
}

export default CommentCard;

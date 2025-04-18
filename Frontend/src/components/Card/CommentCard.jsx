import React, { useState, useEffect } from "react";
import { arrayBufferToBase64 } from "../../ReUsables/arrayTobuffer";
import { ThumbsUp, ThumbsDown, MessageCircle, X } from "lucide-react";
import { APIS } from "../../../config/Config";
import { getTimeAgo } from "../../ReUsables/GetTimeAgo";
import MediaGrid from "../post/MediaGrid";
import { AddComment } from "./Addcomment";
import { CommentOptions } from "./CommentOption";
import CommentSkeleton from "../skeletons/CommentSkeleton";
import { useupdateCommentMutation } from "../../hooks/ReactQuery";
import {
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import Loader from "../../Loaders/Loader";
import { m } from "framer-motion";

function CommentCard(props) {
  // console.log(props.comment)
  const [agrees, setAgrees] = useState(props.comment.likes);
  const [disagrees, setDisagrees] = useState(props.comment.disLikes);
  const currentUser = props.currentUser;
  const agreeOwner = props.currentUser.id;

  const isTemp = props.comment?._id?.startsWith("temp");
  const [isExpanded, setIsExpanded] = useState(false);
  const [localActiveReplyCommentId, setLocalActiveReplyCommentId] =
    useState(null);
  const activeReplyId = props.activeReplyCommentId || localActiveReplyCommentId;
  const showReplyBox = activeReplyId === props.comment._id;
  const [showReplies, setShowReplies] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(props.comment.comment);
  const [visibleReplyPages, setVisibleReplyPages] = useState(1);
  const [isLoadingMoreReplies, setIsLoadingMoreReplies] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [existingFiles, setExistingFiles] = useState(props.comment.media || []);

  const nestingDepth = props.nestingDepth || 0;
  const maxVisualDepthDesktop = 3; // Maximum depth for visual indentation on desktop
  const maxVisualDepthMobile = 1; // Maximum depth for visual indentation on mobile

  const queryClient = useQueryClient();
  const updateCommentMutation = useupdateCommentMutation();
  // Determine if we're on a mobile device
  const [isMobile, setIsMobile] = useState(false);

  const MAX_LENGTH = 200;

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768); // Tailwind's md breakpoint
    };

    // Set initial value
    handleResize();

    // Add event listener
    window.addEventListener("resize", handleResize);

    // Clean up
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Calculate the effective max depth based on screen size
  const effectiveMaxDepth = isMobile
    ? maxVisualDepthMobile
    : maxVisualDepthDesktop;

  // Calculate whether to show full thread or collapse it
  const shouldCollapseThread = isMobile && nestingDepth >= maxVisualDepthMobile;

  const { mutate: deleteComment } = useMutation({
    mutationFn: async (commentId) => await APIS.delComment(commentId),

    onMutate: async (commentId) => {
      await queryClient.cancelQueries(["comments", props.comment?.for_post]);

      const key = ["comments", props.comment?.for_post];
      const previousData = queryClient.getQueryData(key);

      if (!previousData) return;

      queryClient.setQueryData(key, (old) => {
        if (!old?.pages) return old;

        return {
          ...old,
          pages: old.pages.map((page) => ({
            ...page,
            data: page.data?.filter((c) => c._id !== commentId),
          })),
        };
      });

      return { previousData };
    },

    onError: (err, commentId, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(
          ["comments", props.comment?.for_post],
          context.previousData
        );
      }
      console.error("Error deleting comment:", err);
    },

    onSettled: () => {
      // console.log(props.comment)
      console.log("invalidating parent cache", props.comment.for_post);
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
    queryKey: ["comments", props.comment._id],
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
    enabled: true,
  });

  const sendReplyMutation = useMutation({
    mutationFn: async ({ formData, tempId }) => {
      const res = await APIS.addReply(formData);
      return { reply: res.data, tempId };
    },

    onMutate: ({ tempId, formData }) => {
      // Store the previous data to revert in case of an error
      const prevData = queryClient.getQueryData([
        "comments",
        props.comment._id,
      ]);

      // Optimistically add the temporary reply to the cache
      queryClient.setQueryData(["comments", props.comment?._id], (old) => {
        if (!old) return old;
        return {
          ...old,
          pages: old.pages.map((page, index) => {
            if (index === 0) {
              return {
                ...page,
                data: [
                  ...page.data,
                  { _id: tempId, content: formData.content, isTemp: true },
                ],
              };
            }
            return page;
          }),
        };
      });

      return { prevData }; // Return previous data to restore in case of error
    },

    onSuccess: ({ reply, tempId }) => {
      // Replace the temporary reply with the actual reply data
      queryClient.setQueryData(["comments", props.comment._id], (old) => {
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

    onError: (_err, { tempId }, context) => {
      // On error, remove the temporary reply and restore the previous data
      queryClient.setQueryData(["comments", props.comment._id], (old) => {
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

      // Restore the original data in case of error
      queryClient.setQueryData(
        ["comments", props.comment._id],
        context.prevData
      );
    },
    onSettled: () => {
      queryClient.invalidateQueries(["comments", props.comment?.for_post]);
    },
  });

  // Update your handleEditComment function
  const handleEditComment = () => {
    setIsEditing(true);
    setEditText(props.comment.comment);
    setExistingFiles(props.comment.media || []);
    setSelectedFiles([]);
  };

  // Update your handleSaveEdit function
  const handleSaveEdit = async (text, media) => {
    try {
      const formData = new FormData();
      formData.append("content", text);
      formData.append("owner", currentUser.id);

      // Handle media files
      media.forEach((file) => {
        if (file instanceof File) {
          formData.append("files", file);
        } else if (file.url) {
          formData.append("existingFiles", file.url);
        }
      });

      await updateCommentMutation.mutateAsync({
        commentId: props.comment._id,
        postId: props.comment.for_post,
        formData,
      });

      setIsEditing(false);
    } catch (error) {
      console.error("Error saving edit:", error);
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

    console.log(text);
    console.log(media);
    console.log(props.comment._id);

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

  const handleReplyClick = () => {
    if (props.setActiveReplyCommentId) {
      props.setActiveReplyCommentId(showReplyBox ? null : props.comment._id);
    } else {
      setLocalActiveReplyCommentId(showReplyBox ? null : props.comment._id);
    }
  };

  const totalPagesInCache = replies?.pages?.length || 0;
  const shouldShowLoadMore =
    visibleReplyPages < totalPagesInCache || hasNextPage;

  return (
    <>
      <div
        className={`relative flex flex-col items-start space-y-2 p-3 sm:p-4 rounded-lg shadow-sm transition ${
          isTemp
            ? "bg-gray-500"
            : nestingDepth % 2 === 0
            ? "bg-gray-50"
            : "bg-gray-100"
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
                onClick={handleReplyClick}
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

        {/* Replies Section - Responsive Version */}
        {props.comment.comments?.length > 0 && (
          <div
            className={`w-full mt-3 sm:mt-4 ${
              nestingDepth < effectiveMaxDepth
                ? "pl-4 sm:pl-6 md:pl-8"
                : "pl-0 sm:pl-2"
            } relative`}
          >
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

                {/* Only show connecting line up to effectiveMaxDepth */}
                {nestingDepth < effectiveMaxDepth && (
                  <div className="absolute top-0 left-2 sm:left-3 md:left-4 h-full border-l border-gray-300 sm:border-l-2"></div>
                )}

                <div
                  className={`space-y-2 sm:space-y-3 ${
                    nestingDepth < effectiveMaxDepth
                      ? "pl-2 sm:pl-4 md:pl-6"
                      : ""
                  }`}
                >
                  {!loadingReplies ? (
                    replies?.pages
                      ?.slice(0, visibleReplyPages)
                      .flatMap((page) =>
                        page.data.map((reply) => (
                          <CommentCard
                            key={reply._id}
                            comment={reply}
                            agreeOwner={props.agreeOwner}
                            currentUser={props.currentUser}
                            nestingDepth={nestingDepth + 1}
                            // setActiveReplyCommentId={props.setActiveReplyCommentId}
                          />
                        ))
                      )
                  ) : (
                    <CommentSkeleton />
                  )}

                  {shouldShowLoadMore && (
                    <div className="flex flex-col items-center space-y-2">
                      <button
                        onClick={() => {
                          setIsLoadingMoreReplies(true);
                          if (hasNextPage) {
                            fetchNextPage().then(() => {
                              setVisibleReplyPages((prev) => prev + 1);
                              setIsLoadingMoreReplies(false);
                            });
                          } else {
                            setVisibleReplyPages((prev) => prev + 1);
                            setIsLoadingMoreReplies(false);
                          }
                        }}
                        className="text-sm text-blue-700 font-medium hover:underline px-2 py-1"
                        disabled={loadingReplies || isLoadingMoreReplies}
                      >
                        Load More Replies
                      </button>

                      {isLoadingMoreReplies && <Loader />}
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        )}

        {(showReplyBox || isEditing) && (
          <div className="mt-2 w-full bg-gray-100 rounded-lg overflow-hidden">
            {isEditing ? (
              <div className="flex items-center justify-between px-5 pt-2">
                <span className="text-md text-gray-700">
                  Editing your comment
                </span>
                <button
                  onClick={() => setIsEditing(false)}
                  className="text-gray-500 hover:text-red-500 transition-colors"
                >
                  <X size={18} className="hover:scale-110" />
                </button>
              </div>
            ) : (
              <div className="flex items-center justify-between px-5 pt-2">
                <span className="text-md text-gray-700">
                  Replying to{" "}
                  <span className="font-bold text-black">
                    @{props.comment.owner?.user_name}
                  </span>
                </span>
                <button
                  onClick={handleReplyClick}
                  className="text-gray-500 hover:text-red-500 transition-colors"
                >
                  <X size={18} className="hover:scale-110" />
                </button>
              </div>
            )}
            <AddComment
              currentUser={currentUser}
              initialText={isEditing ? editText : ""}
              initialMedia={isEditing ? existingFiles : []}
              onSendReply={handleSendReply}
              onSaveEdit={handleSaveEdit}
              onCancel={
                isEditing ? () => setIsEditing(false) : handleReplyClick
              }
              isEditing={isEditing}
              isReply={!isEditing}
            />
          </div>
        )}
      </div>
    </>
  );
}

export default CommentCard;

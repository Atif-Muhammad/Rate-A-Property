import { useState, useEffect, useRef } from "react";
import { useInfiniteQuery, useQueryClient } from "@tanstack/react-query";
import { useLocation, useParams } from "react-router-dom";
import { APIS } from "../../config/Config";
import CommentCard from "./Card/CommentCard";
import PostCard from "./post/PostCard";
import CommentSkeleton from "./skeletons/CommentSkeleton";
import Loader from "../Loaders/Loader";
import { AddComment } from "./Card/Addcomment";
import { ContentErrorModal } from "./models/ContentErrorModal";

const CommentSection = () => {
  const [activeReplyId, setActiveReplyId] = useState(null);
  const [isInputFocused, setIsInputFocused] = useState(false);
  const [scrollPadding, setScrollPadding] = useState(0);

  const location = useLocation();
  const { postId } = useParams();
  const post = location.state?.post;
  const currentUser = location.state?.currentUser;
  const queryClient = useQueryClient();

  const scrollContainerRef = useRef(null);
  const commentInputRef = useRef(null);

  const [errorModal, setErrorModal] = useState({
    isOpen: false,
    message: "",
  });
  const LIMIT = 10;

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } =
    useInfiniteQuery({
      queryKey: ["comments", postId],
      queryFn: async ({ pageParam = 1 }) => {
        const res = await APIS.getcomments({
          postId,
          page: pageParam,
          limit: LIMIT,
        });
        return res.data;
      },
      getNextPageParam: (lastPage, allPages) => {
        if (lastPage.hasMore) {
          return allPages.length + 1;
        }
        return undefined;
      },
    });

  useEffect(() => {
    const scrollContainer = scrollContainerRef.current;
    if (!scrollContainer) return;

    const handleScroll = () => {
      if (!scrollContainer) return;
      const scrollTop = scrollContainer.scrollTop;
      const containerHeight = scrollContainer.clientHeight;
      const contentHeight = scrollContainer.scrollHeight;

      if (
        scrollTop + containerHeight >= contentHeight - 100 &&
        hasNextPage &&
        !isFetchingNextPage
      ) {
        fetchNextPage();
      }
    };

    scrollContainer.addEventListener("scroll", handleScroll);
    return () => {
      scrollContainer.removeEventListener("scroll", handleScroll);
    };
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  // Adjust scroll position when input is focused
  useEffect(() => {
    if (isInputFocused && scrollContainerRef.current) {
      const inputHeight = commentInputRef.current?.offsetHeight || 0;
      setScrollPadding(inputHeight + 20); // Add some extra padding
    } else {
      setScrollPadding(0);
    }
  }, [isInputFocused]);

  const handleCommentAdded = async (newCommentObj, newFiles) => {
    // Optimistic UI update
    queryClient.setQueryData(["comments", postId], (old) => {
      if (!old) return old;
      return {
        ...old,
        pages: [
          {
            ...old.pages[0],
            data: [newCommentObj, ...old.pages[0].data],
          },
          ...old.pages.slice(1),
        ],
      };
    });

    try {
      // Actual API call
      const formData = new FormData();
      formData.append("owner", currentUser._id);
      formData.append("content", newCommentObj.comment);
      formData.append("for_post", postId);

      if (newFiles && newFiles.length > 0) {
        newFiles.forEach((file) => {
          formData.append("files", file);
        });
      }

      const response = await APIS.addComment(formData);

      if (response.status === 400) {
        // Show error modal
        setErrorModal({
          isOpen: true,
          message:
            response.data?.message ||
            "Your comment violates our community guidelines. Please review the rules and try again.",
        });


        // Revert optimistic update
        queryClient.setQueryData(["comments", postId], (old) => {
          if (!old) return old;
          return {
            ...old,
            pages: [
              {
                ...old.pages[0],
                data: old.pages[0].data.filter(
                  (comment) => comment._id !== newCommentObj._id
                ),
              },
              ...old.pages.slice(1),
            ],
          };
        });
        return;
      }

      // Invalidate queries to get fresh data from server
      queryClient.invalidateQueries({ queryKey: ["comments", postId] });

      // Scroll to top after adding comment
      if (scrollContainerRef.current) {
        setTimeout(() => {
          scrollContainerRef.current.scrollTo({
            top: 0,
            behavior: "smooth",
          });
        }, 100);
      }
    } catch (error) {
      console.error("Error adding comment:", error);
      // Show error modal
      setErrorModal({
        isOpen: true,
        message:
          error.response?.data?.message ||
          "Failed to add comment. Please try again.",
      });

      // Revert optimistic update
      queryClient.setQueryData(["comments", postId], (old) => {
        if (!old) return old;
        return {
          ...old,
          pages: [
            {
              ...old.pages[0],
              data: old.pages[0].data.filter(
                (comment) => comment._id !== newCommentObj._id
              ),
            },
            ...old.pages.slice(1),
          ],
        };
      });
    }
  };

  const closeErrorModal = () => {
    setErrorModal({
      isOpen: false,
      message: "",
    });
  };

  return (
    <div className="flex flex-col items-center w-full h-full justify-center lg:gap-3 gap-6 p-3">
      {/* Left Side - Post Card */}
      <div className="w-full lg:w-1/2">
        <PostCard post={post} currentUser={currentUser} />
      </div>

      {/* Right Side - Comments Section */}
      <div className="w-full lg:w-1/2 bg-white shadow-md rounded-lg p-4 flex flex-col relative">
        <h2 className="text-lg font-semibold mb-3 border-b pb-2 text-center sticky top-0 bg-white z-10">
          Comments
        </h2>

        <div
          ref={scrollContainerRef}
          className="flex-1 space-y-4 mb-4 pr-2 overflow-y-auto"
          style={{
            maxHeight: "calc(100vh - 250px)",
            paddingBottom: `${scrollPadding}px`,
          }}
        >
          {isLoading && !isFetchingNextPage ? (
            <CommentSkeleton />
          ) : (
            <>
              {data?.pages?.flatMap((page) => page.data).length === 0 ? (
                <div className="flex items-center text-center justify-center h-full text-gray-500 font-medium">
                  No comments yet. Be the first to comment!
                </div>
              ) : (
                data?.pages
                  .flatMap((page) => page.data)
                  .map((comment) => (
                    <CommentCard
                      key={comment._id}
                      comment={comment}
                      currentUser={currentUser}
                      activeReplyCommentId={activeReplyId}
                      setActiveReplyCommentId={setActiveReplyId}
                    />
                  ))
              )}
              {!isLoading && isFetchingNextPage && <Loader />}
            </>
          )}
        </div>

        {/* AddComment fixed to bottom but with proper spacing */}
        <div
          className="sticky bottom-0 left-0 right-0 bg-white pt-2 border-t z-20"
          ref={commentInputRef}
        >
          <AddComment
            postId={postId}
            currentUser={currentUser}
            onCommentAdded={handleCommentAdded}
            onFocus={() => setIsInputFocused(true)}
            onBlur={() => setIsInputFocused(false)}
          />
        </div>
      </div>

      <ContentErrorModal
        isOpen={errorModal.isOpen}
        message={errorModal.message}
        onClose={closeErrorModal}
      />
    </div>
  );
};

export default CommentSection;

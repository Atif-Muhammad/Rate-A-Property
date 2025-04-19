import { useState, useEffect, useRef } from "react";
import { useInfiniteQuery, useQueryClient } from "@tanstack/react-query";
import { useLocation, useParams } from "react-router-dom";
import { APIS } from "../../config/Config";
import CommentCard from "./Card/CommentCard";
import PostCard from "./post/PostCard";
import CommentSkeleton from "./skeletons/CommentSkeleton";
import Loader from "../Loaders/Loader";
import { AddComment } from "./Card/Addcomment";

const CommentSection = () => {
  const [activeReplyId, setActiveReplyId] = useState(null);

  const location = useLocation();
  const { postId } = useParams();
  const post = location.state?.post;
  const currentUser = location.state?.currentUser;
  const queryClient = useQueryClient();

  const scrollContainerRef = useRef(null);
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

    if (scrollContainer) {
      scrollContainer.addEventListener("scroll", handleScroll);
    }

    return () => {
      if (scrollContainer) {
        scrollContainer.removeEventListener("scroll", handleScroll);
      }
    };
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const handleCommentAdded = async (newCommentObj, newFiles) => {
    console.log("New comment data being submitted:", newCommentObj);
  
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
  
    // Actual API call
    const formData = new FormData();
    formData.append("owner", currentUser.id);
    formData.append("content", newCommentObj.comment);
    formData.append("for_post", postId);
  
    if (newFiles && newFiles.length > 0) {
      newFiles.forEach((file) => {
        formData.append("files", file);
      });
    }
  
    await APIS.addComment(formData);
  
    // Invalidate cache to fetch updated DB version
    queryClient.invalidateQueries({ queryKey: ["comments", postId] });
  };
  
  return (
    <div className="flex flex-col lg:flex-row items-start w-full h-full justify-center lg:gap-3 gap-6 p-3 overflow-hidden">
      {/* Left Side - Post Card */}
      <div className="w-full lg:w-1/2">
        <PostCard post={post} currentUser={currentUser} />
      </div>

      {/* Right Side - Comments Section */}
      <div className="w-full lg:w-1/2 bg-white shadow-md rounded-lg p-4 flex flex-col h-[85vh] overflow-auto">
        <h2 className="text-lg font-semibold mb-3 border-b pb-2 text-center">
          Comments
        </h2>

        <div
          ref={scrollContainerRef}
          className="flex-1 overflow-y-auto space-y-4 mb-4 pr-2 lg:max-h-[65vh] h-full"
        >
          {isLoading && !isFetchingNextPage ? (
            <CommentSkeleton />
          ) : (
            <>
              {data?.pages?.flatMap((page) => page.data).length === 0 ? (
                <div className="flex items-center justify-center h-full text-gray-500 font-medium">
                  No comments yet.
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

        {/* Add the AddComment component at the bottom */}
        <AddComment
          postId={postId}
          currentUser={currentUser}
          onCommentAdded={handleCommentAdded} 
        />
      </div>
    </div>
  );
};

export default CommentSection;

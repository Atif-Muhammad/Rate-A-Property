import { useState, useEffect, useRef } from "react";
import {
  useQuery,
  useMutation,
  useQueryClient,
  useInfiniteQuery,
} from "@tanstack/react-query";
import { Send, ImagePlus } from "lucide-react";
import { useLocation, useParams } from "react-router-dom";
import { APIS } from "../../config/Config";
import { arrayBufferToBase64 } from "../ReUsables/arrayTobuffer";
import CommentCard from "./Card/CommentCard";
import PostCard from "./post/PostCard";
import CommentSkeleton from "./skeletons/CommentSkeleton";
import Loader from "../Loaders/Loader";
import DiscoverSkeleton from "./skeletons/DiscoverSkeleton";

const CommentSection = () => {
  const location = useLocation();
  const { postId } = useParams();
  const post = location.state?.post;
  const currentUser = location.state?.currentUser;
  const queryClient = useQueryClient();

  const [newComment, setNewComment] = useState("");
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [activeReplyCommentId, setActiveReplyCommentId] = useState(null);

  const scrollContainerRef = useRef(null);

  const LIMIT = 10;

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
  } = useInfiniteQuery({
    queryKey: ["comments", postId],
    queryFn: async ({ pageParam = 1 }) => {
      const res = await APIS.getcomments({
        postId,
        page: pageParam,
        limit: LIMIT,
      });
      // console.log(res.data)
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

    window.addEventListener("scroll", handleScroll);
    return () => {
      if (scrollContainer) {
        scrollContainer.removeEventListener("scroll", handleScroll);
      }
    };
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);


  const addCommentMutation = useMutation({
    mutationFn: async (formData) => {
      return await APIS.addComment(formData);
    },
    onSuccess: () => {
      setSelectedFiles([]);
      setNewComment("");
      queryClient.invalidateQueries({ queryKey: ["comments", postId] });
    },
  });

  const handleFileUpload = (event) => {
    const files = Array.from(event.target.files);
    if (files.length > 0) {
      setSelectedFiles((prevFiles) => [...prevFiles, ...files]);
    }
  };

  const removeFile = (index) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleAddComment = () => {
    if (!newComment.trim() && selectedFiles.length === 0) return;

    const newCommentObj = {
      comment: newComment,
      owner: currentUser,
      for_post: postId,
      createdAt: new Date().toISOString(),
    };
    // console.log(newCommentObj)
    queryClient.setQueryData(["comments", postId], (old) => {
      if(!old) return old;

      return {
        ...old,
        pages: [
          {
            ...old.pages[0],
            data: [newCommentObj, ...old.pages[0].data]
          },
          ...old.pages.slice(1)
        ]
      }
    });

    const formData = new FormData();
    formData.append("owner", currentUser.id);
    formData.append("content", newComment);
    formData.append("for_post", postId);
    selectedFiles.forEach((file) => formData.append("files", file));

    addCommentMutation.mutate(formData);
  };

  return (
    <div className="flex flex-col lg:flex-row items-start w-full h-full justify-center lg:gap-3 gap-6 p-3 overflow-hidden">
      {/* Left Side - Post Card */}
      <div className="w-full lg:w-1/2">
        <PostCard post={post} currentUser={currentUser} />
      </div>

      {/* Right Side - Comments Section */}
      <div className="w-full lg:w-1/2 bg-white shadow-md rounded-lg p-4 flex flex-col h-full overflow-auto">
        <h2 className="text-lg font-semibold mb-3 border-b pb-2 text-center">
          Comments
        </h2>

        <div ref={scrollContainerRef} className="flex-1 overflow-y-auto space-y-4 mb-4 pr-2 lg:max-h-[65vh] h-full ">
          {/* {console.log("current user:", data)} */}

          {data?.pages
            .flatMap((page) => page.data)
            ?.map((comment) => (
              <CommentCard
                key={comment._id}
                comment={comment}
                currentUser={currentUser}
                activeReplyCommentId={activeReplyCommentId}
                setActiveReplyCommentId={setActiveReplyCommentId}
              />
            ))}
          {isLoading && !isFetchingNextPage && <CommentSkeleton />}
          {!isLoading && isFetchingNextPage && <Loader />}
        </div>

        {/* Selected File Previews */}
        {selectedFiles.length > 0 && (
          <div className="bg-gray-300 w-full p-2 rounded-t-lg overflow-x-auto">
            <div className="flex gap-2 flex-nowrap">
              {selectedFiles.map((file, index) => (
                <div
                  key={index}
                  className="relative w-24 h-24 bg-gray-200 rounded-md overflow-hidden flex-shrink-0"
                >
                  <button
                    className="z-10 absolute top-1 right-1 bg-black text-white rounded-full w-5 h-5 flex items-center justify-center text-xs"
                    onClick={() => removeFile(index)}
                  >
                    ✕
                  </button>
                  {file.type.startsWith("image") ? (
                    <img
                      src={URL.createObjectURL(file)}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                  ) : file.type.startsWith("video") ? (
                    <video
                      src={URL.createObjectURL(file)}
                      className="w-full h-full object-cover"
                      controls
                    />
                  ) : null}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Fixed Input Box */}
        <div className="bg-gray-100 p-3 sticky lg:flex bottom-0 rounded-lg flex items-center">
          <img
            src={`data:${
              currentUser?.image?.contentType
            };base64,${arrayBufferToBase64(currentUser?.image?.data?.data)}`}
            alt="user-avatar"
            className="w-10 h-10 rounded-full"
          />

          <input
            type="text"
            placeholder="Write a comment..."
            className="flex-1 p-3 border rounded-full focus:outline-none mx-2 bg-white shadow-sm text-sm"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
          />

          <input
            type="file"
            multiple
            id="fileInput"
            accept="image/*,video/*"
            className="hidden"
            onChange={handleFileUpload}
          />

          <button
            className="text-gray-500 hover:text-gray-600 p-2 rounded-full bg-gray-200 mx-1"
            onClick={() => document.getElementById("fileInput").click()}
          >
            <ImagePlus size={20} />
          </button>

          <button
            className="text-blue-500 hover:text-blue-600 p-3 rounded-full bg-blue-100"
            onClick={handleAddComment}
          >
            <Send size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default CommentSection;

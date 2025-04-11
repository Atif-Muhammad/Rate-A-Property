import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Send, ImagePlus } from "lucide-react";
import { useLocation, useParams } from "react-router-dom";
import { APIS } from "../../config/Config";
import { arrayBufferToBase64 } from "../ReUsables/arrayTobuffer";
import CommentCard from "./Card/CommentCard";
import PostCard from "./post/PostCard";
import CommentSkeleton from "./skeletons/CommentSkeleton";

const CommentSection = () => {
  const location = useLocation();
  const { postId } = useParams();
  const post = location.state?.post;
  const queryClient = useQueryClient();

  const [newComment, setNewComment] = useState("");
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [activeReplyCommentId, setActiveReplyCommentId] = useState(null);

  // ================== Query: User ==================
  const { data: currentUser } = useQuery({
    queryKey: ["currentUser"],
    queryFn: async () => {
      const who = await APIS.userWho();
      const res = await APIS.getUser(who.data.id);
      const user = res.data;
      return {
        owner: user.user_name,
        id: user._id,
        image: user.image,
        user_name: user.user_name,
        posts: user.posts || [],
      };
    },
  });

  // ================== Query: Comments ==================
  const { data: comments = [], isLoading } = useQuery({
    queryKey: ["comments", postId],
    queryFn: async () => {
      const res = await APIS.getcomments(postId);
      return res.data;
    },
  });

  // ================== Mutation: Add Comment ==================
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

  // ================== Handlers ==================
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

    const formData = new FormData();
    formData.append("owner", currentUser.id);
    formData.append("content", newComment);
    formData.append("for_post", postId);
    selectedFiles.forEach((file) => formData.append("files", file));

    addCommentMutation.mutate(formData);
  };

  return (
    <div className="flex flex-col lg:flex-row items-start w-full justify-center lg:gap-3 gap-6 p-4">
      {/* Left Side - Post Card */}
      <div className="w-full lg:w-1/2">
        <PostCard post={post} />
      </div>

      {/* Right Side - Comments Section */}
      <div className="w-full lg:w-1/2 bg-white shadow-md rounded-lg p-4 flex flex-col h-full lg:h-[90vh]">
        <h2 className="text-lg font-semibold mb-3 border-b pb-2 text-center">Comments</h2>

        <div className="flex-1 overflow-y-auto space-y-4 mb-4 pr-2 lg:max-h-[65vh] h-full">
          {isLoading ? (
            <CommentSkeleton />
          ) : (
            comments.map((comment) => (
              <CommentCard
                key={comment._id}
                comment={comment}
                agreeOwner={currentUser}
                activeReplyCommentId={activeReplyCommentId}
                setActiveReplyCommentId={setActiveReplyCommentId}
              />
            ))
          )}
        </div>

        {/* Selected File Previews */}
        {selectedFiles.length > 0 && (
          <div className="bg-gray-300 w-full p-2 rounded-t-lg overflow-x-auto">
            <div className="flex gap-2 flex-nowrap">
              {selectedFiles.map((file, index) => (
                <div key={index} className="relative w-24 h-24 bg-gray-200 rounded-md overflow-hidden flex-shrink-0">
                  <button
                    className="z-10 absolute top-1 right-1 bg-black text-white rounded-full w-5 h-5 flex items-center justify-center text-xs"
                    onClick={() => removeFile(index)}
                  >
                    ✕
                  </button>
                  {file.type.startsWith("image") ? (
                    <img src={URL.createObjectURL(file)} alt="Preview" className="w-full h-full object-cover" />
                  ) : file.type.startsWith("video") ? (
                    <video src={URL.createObjectURL(file)} className="w-full h-full object-cover" controls />
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

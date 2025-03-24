import { useEffect, useState } from "react";
import { Send, ImagePlus } from "lucide-react";
import { useLocation, useParams } from "react-router-dom";
import { APIS } from "../../config/Config";
import { arrayBufferToBase64 } from "../ReUsables/arrayTobuffer";
import CommentCard from "./Card/CommentCard";
import PostCard from "./post/PostCard";

const CommentSection = () => {
  const location = useLocation();
  const { postId } = useParams();
  const post = location.state?.post;
  const [currentUser, setCurrentUser] = useState({});
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [mediaPreviews, setMediaPreviews] = useState([]);

  // Handle file selection
  const handleFileUpload = (event) => {
    const files = Array.from(event.target.files);
    if (files.length > 0) {
      setSelectedFiles((prevFiles) => [...prevFiles, ...files]);
    }
  };

  const removeFile = (index) => {
    setSelectedFiles((prevFiles) => prevFiles.filter((_, i) => i !== index));
  };

  const handleAddComment = async () => {
    if (!newComment.trim() && selectedFiles.length === 0) return;
    const tempId = `temp-${Date.now()}`;

    // Store media previews correctly
    const mediaPreviews = selectedFiles.map((file) => {
      const fileExt = file.name.split(".").pop().toLowerCase();
      const mediaType = ["mp4", "webm", "mov"].includes(fileExt)
        ? "video"
        : "image";
      const url = URL.createObjectURL(file); // Create blob URL for preview

      return {
        _id: `temp-media-${Date.now()}`, // Temporary ID for UI
        filename: file.name,
        type: mediaType,
        url, // Store the generated URL
        likes: [],
        disLikes: [],
      };
    });

    const newCommentData = {
      _id: tempId,
      owner: {
        id: currentUser.id,
        user_name: currentUser.user_name,
        image: currentUser.image,
      },
      comment: newComment,
      for_post: postId,
      createdAt: new Date().toISOString(),
      likes: [],
      disLikes: [],
      media: mediaPreviews,
    };

    // Add temporary comment to UI
    setComments((prevComments) => [newCommentData, ...prevComments]);

    try {
      const formData = new FormData();
      formData.append("owner", currentUser.id);
      formData.append("content", newComment);
      formData.append("for_post", postId);
      selectedFiles.forEach((file) => formData.append("files", file));

      // for (let [key, value] of formData.entries()) {
      //   console.log(`${key}:`, value);
      // }

      setNewComment("");
      const res = await APIS.addComment(formData);

      if (res.status === 200) {
        setSelectedFiles([]);
        setComments((prevComments) =>
          prevComments.map((comment) =>
            comment._id === tempId ? res.data : comment
          )
        );
      }
    } catch (error) {
      console.error("Error adding comment:", error);
      setComments((prevComments) =>
        prevComments.filter((comment) => comment._id !== tempId)
      );
    }
  };

  const getUserDetails = async () => {
    try {
      const res = await APIS.userWho();
      if (res.status === 200) {
        const userRes = await APIS.getUser(res.data.id);
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

  const getComments = async () => {
    try {
      const res = await APIS.getcomments(postId);
      if (res.status === 200) {
        // console.log("comments: ",res)
        setComments(res.data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    getUserDetails();
    getComments();
  }, []);

  return (
    <div className="flex flex-col lg:flex-row items-start   w-full justify-center  lg:gap-3 gap-6 p-4  ">
      {/* Left Side - Post Card */}
      <div className="w-full lg:w-1/2">
        <PostCard postId={postId} />
      </div>

      {/* Right Side - Comments Section */}
      <div className="w-full lg:w-1/2  bg-white shadow-md rounded-lg p-4 flex flex-col h-full lg:h-[90vh]">
        {/* Header */}
        <h2 className="text-lg font-semibold mb-3 border-b pb-2 text-center">
          Comments
        </h2>

        <div className="flex-1 overflow-y-auto space-y-4 mb-4 pr-2 lg:max-h-[65vh] h-full">
          {comments.length > 0 ?
            comments?.map((comment) => (
              <CommentCard
                comment={comment}
                agreeOwner={currentUser.id}
                key={comment._id}
              />
            )): <>No comments</>}
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
              currentUser.image?.contentType
            };base64,${arrayBufferToBase64(currentUser.image?.data?.data)}`}
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

          {/* File Input (Hidden) */}
          <input
            type="file"
            multiple
            id="fileInput"
            accept="image/*,video/*"
            className="hidden"
            onChange={handleFileUpload}
          />

          {/* Camera Icon for File Selection */}
          <button
            className="text-gray-500 hover:text-gray-600 p-2 rounded-full bg-gray-200 mx-1"
            onClick={() => document.getElementById("fileInput").click()}
          >
            <ImagePlus size={20} />
          </button>

          {/* Send Button */}
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

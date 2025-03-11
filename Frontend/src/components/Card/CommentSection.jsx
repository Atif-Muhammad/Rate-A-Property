import { useEffect, useState } from "react";
import {
  Send,
  ThumbsUp,
  ThumbsDown,
  MessageCircle,
  MoreHorizontal,
} from "lucide-react";
import { useLocation, useParams } from "react-router-dom";
import { APIS } from "../../../config/Config";
import { arrayBufferToBase64 } from "../../ReUsables/arrayTobuffer";
import CommentCard from "./CommentCard";
import PostCard from "./PostCard";

const CommentSection = () => {
  const location = useLocation();
  const { postId } = useParams();
  const post = location.state?.post;
  const [ownerDetails, setOwnerDetails] = useState({});
  const [currentUser, setCurrentUser] = useState({});

  const [comments, setComments] = useState([]);

  const [newComment, setNewComment] = useState("");

  const handleAddComment = async () => {
    if (!newComment.trim()) return;

    const tempId = `temp-${Date.now()}`; // More unique temp ID
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
    };

    // Add temp comment without affecting likes/dislikes
    setComments((prevComments) => [newCommentData, ...prevComments]);
    setNewComment("");

    try {
      const res = await APIS.addComment({
        owner: currentUser.id,
        content: newComment,
        for_post: postId,
      });

      if (res.status === 200) {
        setComments((prevComments) =>
          prevComments.map((comment) =>
            comment._id === tempId ? res.data : comment
          )
        );
      }
    } catch (err) {
      console.error(err);
      setComments((prevComments) =>
        prevComments.filter((comment) => comment._id !== tempId)
      );
    }
  };

  const getUserDetails = async () => {
    await APIS.userWho()
      .then(async (res) => {
        if (res.status === 200) {
          await APIS.getUser(res.data.id)
            .then((res) => {
              // console.log(res.data)
              if (res.status === 200) {
                const details = {
                  owner: res.data.user_name,
                  id: res.data._id,
                  image: res.data.image,
                  likes: res.data.likes,
                  disLikes: res.data.disLikes,
                  user_name: res.data.user_name,
                  posts: res.data.posts || [],
                };
                // console.log(details);
                setCurrentUser(details);
              }
            })
            .catch((err) => {
              console.log(err);
            });
        }
      })
      .catch((err) => {
        console.log(err);
      });
  };

  const getComments = async () => {
    await APIS.getcomments(postId)
      .then((res) => {
        if (res.status === 200) {
          setComments(res.data);
        }
      })
      .catch((err) => {
        console.log(err);
      });
  };

  useEffect(() => {
    getUserDetails();
    getComments();
    // console.log(postId)
    // console.log(post)
  }, []);

  return (
    <div className="flex pt-14 lg:flex-row items-center gap-2 flex-col h-screen ">
      <PostCard post={post} />
      <div className="w-full max-w-lg mx-auto bg-white shadow-md rounded-lg p-4 flex flex-col h-screen">
        {/* Header */}
        <h2 className="text-lg font-semibold mb-3 border-b pb-2">Comments</h2>

        {/* Scrollable Comments List */}
        <div className="flex-1 overflow-y-auto space-y-4 mb-4 pr-2">
          {comments?.map((comment) => (
            <CommentCard
              comment={comment}
              agreeOwner={currentUser.id}
              key={comment._id}
            />
          ))}
        </div>

        {/* Fixed Input Box */}
        <div className="border-t bg-gray-100 p-3 rounded-lg flex items-center sticky bottom-0">
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

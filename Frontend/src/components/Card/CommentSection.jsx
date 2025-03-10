import { useState } from "react";
import {
  Send,
  ThumbsUp,
  ThumbsDown,
  MessageCircle,
  MoreHorizontal,
} from "lucide-react";

const CommentSection = () => {
  const [comments, setComments] = useState([
    {
      username: "Ali",
      text: "Nice post!",
      time: "15 minutes ago",
      avatar: "https://i.pravatar.cc/40?img=1",
      likes: 2,
      dislikes: 0,
      userReaction: null, // 'like' or 'dislike'
    },
    {
      username: "Sara",
      text: "Great content, keep it up!",
      time: "9 minutes ago",
      avatar: "https://i.pravatar.cc/40?img=2",
      likes: 5,
      dislikes: 1,
      userReaction: null,
    },
    {
      username: "Ahmed",
      text: "Amazing insights, thanks for sharing!",
      time: "5 minutes ago",
      avatar: "https://i.pravatar.cc/40?img=3",
      likes: 1,
      dislikes: 0,
      userReaction: null,
    },
  ]);

  const [newComment, setNewComment] = useState("");

  const handleAddComment = () => {
    if (newComment.trim() !== "") {
      const newCommentObj = {
        username: "You",
        text: newComment,
        time: "Just now",
        avatar: "https://i.pravatar.cc/40?img=4",
        likes: 0,
        dislikes: 0,
        userReaction: null,
      };
      setComments([newCommentObj, ...comments]);
      setNewComment("");
    }
  };

  const handleReaction = (index, type) => {
    setComments((prevComments) =>
      prevComments.map((comment, i) => {
        if (i === index) {
          if (comment.userReaction === type) {
            // If already reacted, remove reaction
            return {
              ...comment,
              likes: type === "like" ? comment.likes - 1 : comment.likes,
              dislikes:
                type === "dislike" ? comment.dislikes - 1 : comment.dislikes,
              userReaction: null,
            };
          } else {
            return {
              ...comment,
              likes:
                type === "like"
                  ? comment.userReaction === "dislike"
                    ? comment.likes + 1
                    : comment.likes + 1
                  : comment.userReaction === "like"
                  ? comment.likes - 1
                  : comment.likes,
              dislikes:
                type === "dislike"
                  ? comment.userReaction === "like"
                    ? comment.dislikes + 1
                    : comment.dislikes + 1
                  : comment.userReaction === "dislike"
                  ? comment.dislikes - 1
                  : comment.dislikes,
              userReaction: type,
            };
          }
        }
        return comment;
      })
    );
  };

  return (
    <div className="w-full max-w-lg mx-auto bg-white shadow-md rounded-lg p-4">
      <h2 className="text-lg font-semibold mb-3 border-b pb-2">Comments</h2>
      <div className="space-y-4 mb-4">
        {comments.map((comment, index) => (
          <div
            key={index}
            className="flex items-start space-x-3 p-4 bg-gray-100 rounded-lg shadow-sm relative"
          >
            <img
              src={comment.avatar}
              alt="avatar"
              className="w-12 h-12 rounded-full"
            />
            <div className="flex-1">
              <div className="flex items-center space-x-2">
                <span className="font-semibold text-gray-900">
                  {comment.username}
                </span>
                <span className="text-xs text-gray-500">{comment.time}</span>
              </div>
              <p className="text-gray-800 mt-1">{comment.text}</p>
              <div className="flex space-x-4 text-sm text-gray-500 mt-2">
                <button
                  className={`flex items-center space-x-1 ${
                    comment.userReaction === "like"
                      ? "text-blue-600"
                      : "hover:text-blue-600"
                  }`}
                  onClick={() => handleReaction(index, "like")}
                >
                  <ThumbsUp size={16} /> <span>Like ({comment.likes})</span>
                </button>
                <button
                  className={`flex items-center space-x-1 ${
                    comment.userReaction === "dislike"
                      ? "text-red-600"
                      : "hover:text-red-600"
                  }`}
                  onClick={() => handleReaction(index, "dislike")}
                >
                  <ThumbsDown size={16} />{" "}
                  <span>Dislike ({comment.dislikes})</span>
                </button>
                <button className="flex items-center space-x-1 hover:text-blue-600">
                  <MessageCircle size={16} /> <span>Reply</span>
                </button>
              </div>
            </div>
            <button className="absolute top-2 right-2 text-gray-500 hover:text-gray-700">
              <MoreHorizontal size={20} />
            </button>
          </div>
        ))}
      </div>
      <div className="flex items-center border-t pt-3 bg-gray-100 p-3 rounded-lg">
        <img
          src="https://i.pravatar.cc/40?img=4"
          alt="user-avatar"
          className="w-12 h-12 rounded-full"
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
  );
};

export default CommentSection;

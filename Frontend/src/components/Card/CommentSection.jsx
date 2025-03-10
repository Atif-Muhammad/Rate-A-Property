import { useState } from "react";
import { Send, ThumbsUp } from "lucide-react";

const CommentSection = () => {
  const [comments, setComments] = useState([
    {
      username: "Ali",
      text: "Nice post!",
      time: "15m",
      avatar: "https://i.pravatar.cc/40?img=1",
    },
    {
      username: "Sara",
      text: "Great content, keep it up!",
      time: "9m",
      avatar: "https://i.pravatar.cc/40?img=2",
    },
    {
      username: "Ahmed",
      text: "Amazing insights, thanks for sharing!",
      time: "5m",
      avatar: "https://i.pravatar.cc/40?img=3",
    },
  ]);
  const [newComment, setNewComment] = useState("");

  const handleAddComment = () => {
    if (newComment.trim() !== "") {
      const newCommentObj = {
        username: "You", // Assume user is logged in
        text: newComment,
        time: "Just now",
        avatar: "https://i.pravatar.cc/40?img=4", // Dummy avatar
      };
      setComments([newCommentObj, ...comments]);
      setNewComment("");
    }
  };

  return (
    <div className="w-full max-w-lg mx-auto bg-white shadow rounded-lg p-4">
      <h2 className="text-lg font-semibold mb-3 border-b pb-2">Comments</h2>
      <div className="space-y-3 mb-4">
        {comments.map((comment, index) => (
          <div
            key={index}
            className="flex items-start space-x-2 p-3 bg-gray-100 rounded-lg shadow-sm"
          >
            <img
              src={comment.avatar}
              alt="avatar"
              className="w-10 h-10 rounded-full"
            />
            <div className="flex-1">
              <div className="flex justify-between items-center">
                <span className="font-semibold text-gray-800">
                  {comment.username}
                </span>
                <span className="text-xs text-gray-500">{comment.time}</span>
              </div>
              <p className="text-gray-700 mt-1">{comment.text}</p>
              <div className="flex space-x-3 mt-1 text-xs text-gray-500">
                <button className="flex items-center space-x-1 hover:text-blue-600">
                  <ThumbsUp size={14} /> <span>Like</span>
                </button>
                <button className="hover:text-blue-600">Reply</button>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="flex items-center border-t pt-3 bg-gray-100 p-2 rounded-lg">
        <img
          src="https://i.pravatar.cc/40?img=4"
          alt="user-avatar"
          className="w-10 h-10 rounded-full"
        />
        <input
          type="text"
          placeholder="Write a comment..."
          className="flex-1 p-2 border rounded-full focus:outline-none mx-2"
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
        />
        <button
          className="text-blue-500 hover:text-blue-600"
          onClick={handleAddComment}
        >
          <Send size={20} />
        </button>
      </div>
    </div>
  );
};

export default CommentSection;

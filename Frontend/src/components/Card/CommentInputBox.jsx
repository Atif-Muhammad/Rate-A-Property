import { useState, useEffect } from "react";
import { ImagePlus, Send, X } from "lucide-react";
import { arrayBufferToBase64 } from "../../ReUsables/arrayTobuffer";

export function CommentInputBox({
  currentUser,
  initialText = "",
  onSendReply,
  onCancel,
}) {
  const [replyText, setReplyText] = useState(initialText);
  const [replyMedia, setReplyMedia] = useState([]);

  // Update replyText when initialText changes
  useEffect(() => {
    setReplyText(initialText);
  }, [initialText]);

  const handleReplyFileUpload = (e) => {
    const files = Array.from(e.target.files);
    setReplyMedia([...replyMedia, ...files]);
  };

  const handleRemoveMedia = (index) => {
    setReplyMedia((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSendReply = () => {
    if (replyText.trim() || replyMedia.length > 0) {
      onSendReply(replyText, replyMedia);
      setReplyText(""); // Reset text input
      setReplyMedia([]); // Reset media files
    }
  };

  const handleCancel = () => {
    setReplyText(""); // Clear text input
    setReplyMedia([]); // Clear media files
    onCancel(); // Call parent cancel function
  };

  return (
    <div className="flex flex-col w-full mt-3 space-y-2">
      {/* Media Previews */}
      {replyMedia.length > 0 && (
        <div className="flex space-x-2 overflow-x-auto pb-1">
          {replyMedia.map((file, index) => (
            <div key={index} className="relative w-20 h-20 flex-shrink-0">
              {file.type.startsWith("image/") ? (
                <img
                  src={URL.createObjectURL(file)}
                  alt="preview"
                  className="w-full h-full object-cover rounded"
                />
              ) : (
                <video
                  src={URL.createObjectURL(file)}
                  className="w-full h-full object-cover rounded"
                  controls
                />
              )}
              <button
                onClick={() => handleRemoveMedia(index)}
                className="absolute -top-2 -right-2 bg-white rounded-full shadow p-1 hover:bg-gray-200"
              >
                <X size={14} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Input Section */}
      <div className="flex items-center space-x-2 w-full">
        {/* User Avatar */}
        <img
          src={`data:${
            currentUser?.image?.contentType
          };base64,${arrayBufferToBase64(currentUser?.image?.data?.data)}`}
          alt="user-avatar"
          className="w-9 h-9 rounded-full"
        />

        {/* Input Box */}
        <div className="flex items-center flex-1 border rounded-full px-4 py-2 bg-white shadow-sm">
          <input
            type="text"
            placeholder="Write a reply..."
            className="flex-1 focus:outline-none text-sm bg-transparent"
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
          />

          {/* Upload Button */}
          <input
            type="file"
            multiple
            id="replyFileInput"
            accept="image/*,video/*"
            className="hidden"
            onChange={handleReplyFileUpload}
          />
          <button
            onClick={() => document.getElementById("replyFileInput").click()}
            className="text-gray-500 hover:text-gray-600 mx-1"
          >
            <ImagePlus size={20} />
          </button>

          {/* Send Button */}
          <button
            onClick={handleSendReply}
            className="text-blue-500 hover:text-blue-600"
          >
            <Send size={20} />
          </button>
        </div>

        {/* Cancel Button */}
        <button
          className="text-gray-400 hover:text-gray-600 text-xs"
          onClick={handleCancel}
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

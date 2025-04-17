import { useState, useEffect } from "react";
import { ImagePlus, Send, X, Loader2 } from "lucide-react";
import { arrayBufferToBase64 } from "../../ReUsables/arrayTobuffer";

export function CommentInputBox({
  currentUser,
  initialText = "",
  initialMedia = [],
  onSendReply,
  onCancel,
  isEditing = false,
}) {
  const [replyText, setReplyText] = useState(initialText);
  const [newFiles, setNewFiles] = useState([]);
  const [existingMedia, setExistingMedia] = useState(initialMedia);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setReplyText(initialText);
    setExistingMedia(initialMedia);
    setNewFiles([]);
  }, [initialText, initialMedia]);

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files);
    setNewFiles((prev) => [...prev, ...files]);
  };

  const handleRemoveNewFile = (index) => {
    setNewFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleRemoveExistingMedia = (index) => {
    setExistingMedia((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (isSubmitting) return;

    setIsSubmitting(true);
    try {
      await onSendReply(replyText, [...newFiles, ...existingMedia]);
      // Reset only if the operation was successful
      setReplyText("");
      setNewFiles([]);
      setExistingMedia([]);
    } catch (error) {
      console.error("Error submitting comment:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setReplyText("");
    setNewFiles([]);
    setExistingMedia([]);
    onCancel();
  };

  const isDisabled =
    (!replyText.trim() &&
      newFiles.length === 0 &&
      existingMedia.length === 0) ||
    isSubmitting;

  return (
    <div className="flex flex-col w-full mt-3 space-y-2">
      {/* Media Previews */}
      {(newFiles.length > 0 || existingMedia.length > 0) && (
        <div className="flex space-x-2 overflow-x-auto pb-1">
          {/* Existing media previews */}
          {existingMedia.map((media, index) => (
            <div
              key={`existing-${index}`}
              className="relative w-20 h-20 flex-shrink-0"
            >
              {media.type === "image" || media.type?.startsWith("image/") ? (
                <img
                  src={media.url || URL.createObjectURL(media)}
                  alt="preview"
                  className="w-full h-full object-cover rounded"
                />
              ) : (
                <video
                  src={media.url || URL.createObjectURL(media)}
                  className="w-full h-full object-cover rounded"
                  controls
                />
              )}
              <button
                onClick={() => handleRemoveExistingMedia(index)}
                className="absolute -top-2 -right-2 bg-white rounded-full shadow p-1 hover:bg-gray-200"
                disabled={isSubmitting}
              >
                <X size={14} />
              </button>
            </div>
          ))}

          {/* New files previews */}
          {newFiles.map((file, index) => (
            <div
              key={`new-${index}`}
              className="relative w-20 h-20 flex-shrink-0"
            >
              {file.type?.startsWith("image/") ? (
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
                onClick={() => handleRemoveNewFile(index)}
                className="absolute -top-2 -right-2 bg-white rounded-full shadow p-1 hover:bg-gray-200"
                disabled={isSubmitting}
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
        {currentUser?.image?.contentType ? (
          <img
            src={`data:${
              currentUser.image.contentType
            };base64,${arrayBufferToBase64(currentUser.image.data?.data)}`}
            alt="user-avatar"
            className="w-9 h-9 rounded-full"
          />
        ) : (
          <img
            src={currentUser?.image}
            alt="user-avatar"
            className="w-9 h-9 rounded-full"
          />
        )}

        {/* Input Box */}
        <div className="flex items-center flex-1 border rounded-full px-4 py-2 bg-white shadow-sm">
          <input
            type="text"
            placeholder={
              isEditing ? "Edit your comment..." : "Write a reply..."
            }
            className="flex-1 focus:outline-none text-sm bg-transparent"
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            onKeyPress={(e) =>
              e.key === "Enter" && !isDisabled && handleSubmit()
            }
            disabled={isSubmitting}
          />

          {/* Upload Button */}
          <input
            type="file"
            multiple
            id="commentFileInput"
            accept="image/*,video/*"
            className="hidden"
            onChange={handleFileUpload}
            disabled={isSubmitting}
          />
          <label
            htmlFor="commentFileInput"
            className={`text-gray-500 hover:text-gray-600 mx-1 cursor-pointer ${
              isSubmitting ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            <ImagePlus size={20} />
          </label>

          {/* Send Button */}
          <button
            onClick={handleSubmit}
            className={`text-blue-500 hover:text-blue-600 ${
              isDisabled ? "opacity-50 cursor-not-allowed" : ""
            }`}
            disabled={isDisabled}
          >
            {isSubmitting ? (
              <Loader2 size={20} className="animate-spin" />
            ) : (
              <Send size={20} />
            )}
          </button>
        </div>

        {/* Cancel Button */}
        <button
          className={`text-gray-400 hover:text-gray-600 text-xs ${
            isSubmitting ? "opacity-50 cursor-not-allowed" : ""
          }`}
          onClick={handleCancel}
          disabled={isSubmitting}
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

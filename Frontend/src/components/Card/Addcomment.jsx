import { useState, useEffect, useRef, useCallback } from "react";
import { Send, ImagePlus, X, Loader2 } from "lucide-react";
import { arrayBufferToBase64 } from "../../ReUsables/arrayTobuffer";

export const AddComment = ({
  postId,
  currentUser,
  onCommentAdded,
  onSendReply,
  onSaveEdit,
  onCancel,
  initialText = "",
  initialMedia = [],
  isEditing = false,
  isReply = false,
}) => {
  // Use separate state for controlled input
  const [text, setText] = useState(initialText);
  const [newFiles, setNewFiles] = useState([]);
  const [existingMedia, setExistingMedia] = useState(initialMedia);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    setText(initialText || "");
  }, [initialText]);
  
  // Update media when initialMedia changes
  useEffect(() => {
    setExistingMedia(initialMedia);
  }, [initialMedia]);

  const handleFileUpload = useCallback((e) => {
    const files = Array.from(e.target.files);
    setNewFiles((prev) => [...prev, ...files]);
  }, []);

  const removeFile = useCallback((index, isNew) => {
    if (isNew) {
      setNewFiles((prev) => prev.filter((_, i) => i !== index));
    } else {
      setExistingMedia((prev) => prev.filter((_, i) => i !== index));
    }
  }, []);

  const handleTextChange = useCallback((e) => {
    setText(e.target.value);
  }, []);

  const handleSubmit = useCallback(async () => {
    if (
      (!text.trim() && newFiles.length === 0 && existingMedia.length === 0) ||
      isSubmitting
    ) {
      return;
    }

    setIsSubmitting(true);
    try {
      const media = [...existingMedia, ...newFiles];

      // Log the data before submission
      console.log("Submitting comment with text:", text);
      console.log("Submitting comment with media:", media);

      if (isEditing) {
        await onSaveEdit?.(text, media);
      } else if (isReply) {
        await onSendReply?.(text, media);
      } else {
        const optimisticComment = {
          _id: `temp-${Date.now()}`,
          comment: text,
          owner: currentUser,
          media: media.map((file) => ({
            url: file.url || URL.createObjectURL(file),
            type: file.type?.startsWith("image") ? "image" : "video",
          })),
          createdAt: new Date().toISOString(),
          likes: [],
          disLikes: [],
        };
        await onCommentAdded?.(optimisticComment);
      }

      if (!isEditing) {
        setText("");
        setNewFiles([]);
        setExistingMedia([]);
      }
    } catch (error) {
      console.error("Submission failed:", error);
    } finally {
      setIsSubmitting(false);
    }
  }, [
    text,
    newFiles,
    existingMedia,
    isSubmitting,
    isEditing,
    isReply,
    onSaveEdit,
    onSendReply,
    onCommentAdded,
    currentUser,
  ]);

  const isDisabled =
    (!text.trim() && newFiles.length === 0 && existingMedia.length === 0) ||
    isSubmitting;

  return (
    <div className="sticky bottom-0 w-full  bg-gray-100 rounded-lg">
      {/* Media Previews */}
      {(newFiles.length > 0 || existingMedia.length > 0) && (
        <div className="p-2 bg-gray-200 rounded-t-lg flex gap-2 overflow-x-auto">
          {[...existingMedia, ...newFiles].map((file, index) => (
            <div key={index} className="relative w-24 h-24 flex-shrink-0">
              <button
                onClick={() => removeFile(index, index >= existingMedia.length)}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 z-10"
                type="button"
              >
                <X size={14} />
              </button>
              {file.type?.startsWith("image") ? (
                <img
                  src={file.url || URL.createObjectURL(file)}
                  alt="Preview"
                  className="w-full h-full object-cover rounded-md"
                />
              ) : (
                <video
                  src={file.url || URL.createObjectURL(file)}
                  className="w-full h-full object-cover rounded-md"
                  controls
                />
              )}
            </div>
          ))}
        </div>
      )}

      {/* Input Area */}
      <div className="p-3 flex items-center">
        <img
          src={
            currentUser?.image?.contentType
              ? `data:${
                  currentUser.image.contentType
                };base64,${arrayBufferToBase64(currentUser.image.data?.data)}`
              : currentUser?.image
          }
          alt="user-avatar"
          className="w-10 h-10 rounded-full"
        />

        <div className="flex-1 mx-2 relative">
          <input
            type="text"
            placeholder={
              isEditing
                ? "Edit your comment..."
                : isReply
                ? "Write a reply..."
                : "Write a comment..."
            }
            className="w-full p-3 border rounded-full focus:outline-none bg-white shadow-sm text-sm"
            value={text}
            onChange={handleTextChange}
            onKeyPress={(e) =>
              e.key === "Enter" && !isDisabled && handleSubmit()
            }
            disabled={isSubmitting}
          />

          <input
            type="file"
            ref={fileInputRef}
            multiple
            accept="image/*,video/*"
            className="hidden"
            onChange={handleFileUpload}
            disabled={isSubmitting}
          />
        </div>

        <div className="flex gap-1">
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isSubmitting}
            className="p-2 text-gray-600 hover:text-blue-600 disabled:opacity-50"
            type="button"
          >
            <ImagePlus size={20} />
          </button>

          <button
            onClick={handleSubmit}
            disabled={isDisabled}
            className={`p-2 rounded-full ${
              isSubmitting
                ? "bg-blue-200 text-blue-600"
                : "bg-blue-100 text-blue-600 hover:bg-blue-200"
            } disabled:opacity-50`}
            type="button"
          >
            {isSubmitting ? (
              <Loader2 size={20} className="animate-spin" />
            ) : (
              <Send size={20} />
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

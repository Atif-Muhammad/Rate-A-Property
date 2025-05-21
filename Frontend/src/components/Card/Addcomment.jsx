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
  const [text, setText] = useState(initialText);
  const [newFiles, setNewFiles] = useState([]);
  const [existingMedia, setExistingMedia] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef(null);
  const hasInitialized = useRef(false);

  useEffect(() => {
    setText(initialText || "");
  }, [initialText]);

  useEffect(() => {
    if (!hasInitialized.current) {
      setExistingMedia(initialMedia || []);
      hasInitialized.current = true;
    }
  }, [initialMedia]);

  const handleFileUpload = useCallback(
    (e) => {
      if (isSubmitting) return; // Prevent file upload during submission
      const files = Array.from(e.target.files);
      setNewFiles((prev) => [...prev, ...files]);
      e.target.value = null; // Reset input to allow same file selection
    },
    [isSubmitting]
  ); // Add isSubmitting to dependencies

  const removeFile = useCallback(
    (index, isNew) => {
      if (isSubmitting) return; // Prevent file removal during submission
      if (isNew) {
        setNewFiles((prev) => prev.filter((_, i) => i !== index));
      } else {
        setExistingMedia((prev) => prev.filter((_, i) => i !== index));
      }
    },
    [isSubmitting]
  ); // Add isSubmitting to dependencies

  const handleTextChange = useCallback(
    (e) => {
      if (isSubmitting) return; // Prevent text changes during submission
      setText(e.target.value);
    },
    [isSubmitting]
  ); // Add isSubmitting to dependencies

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

      if (isEditing) {
        await onSaveEdit?.(text, media);
      } else if (isReply) {
        await onSendReply?.(text, media);
      } else {
        const optimisticComment = {
          _id: `temp-${Date.now()}`,
          comment: text,
          owner: currentUser,
          media: [
            ...existingMedia,
            ...newFiles.map((file) => ({
              originalname: file.name,
              url: URL.createObjectURL(file),
              type: file.type?.startsWith("image") ? "image" : "video",
            })),
          ],
          createdAt: new Date().toISOString(),
          likes: [],
          disLikes: [],
        };
        await onCommentAdded?.(optimisticComment, newFiles);
      }

      if (!isEditing) {
        setText("");
        setNewFiles([]);
        setExistingMedia([]);
        hasInitialized.current = false;
      }
    } catch (error) {
      console.error(
        "Submission failed:",
        error.response?.data?.message || error.message
      );
      throw error;
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
    <div className="lg:max-w-3xl w-full bg-gray-100 rounded-lg shadow-sm">
      {/* Media preview section */}
      {(newFiles.length > 0 || existingMedia.length > 0) && (
        <div className="p-3 bg-gray-50 border-b rounded-t-lg flex gap-3 overflow-x-auto">
          {[...existingMedia, ...newFiles].map((file, index) => {
            const isNew = index >= existingMedia.length;
            const fileObj = isNew
              ? newFiles[index - existingMedia.length]
              : existingMedia[index];
            const src = fileObj.url || URL.createObjectURL(fileObj);
            const type =
              fileObj.type ||
              (fileObj.url?.includes("video") ? "video" : "image");

            return (
              <div
                key={index}
                className="relative w-24 h-24 flex-shrink-0 group"
              >
                {!isSubmitting && ( // Only show remove button when not submitting
                  <button
                    onClick={() => removeFile(index, isNew)}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 z-10"
                    type="button"
                    aria-label="Remove media"
                    disabled={isSubmitting}
                  >
                    <X size={14} />
                  </button>
                )}
                {type.startsWith("image") ? (
                  <img
                    src={src}
                    alt="Preview"
                    className="w-full h-full object-cover rounded-md border border-gray-200"
                  />
                ) : (
                  <video
                    src={src}
                    className="w-full h-full object-cover rounded-md border border-gray-200"
                    controls
                  />
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Input section */}
      <div className="p-3 flex items-center gap-3">
        <img
          src={
            currentUser?.image?.contentType
              ? `data:${
                  currentUser.image.contentType
                };base64,${arrayBufferToBase64(currentUser.image.data?.data)}`
              : currentUser?.image
          }
          alt="User avatar"
          className="w-10 h-10 rounded-full border-2 border-white shadow-sm"
        />

        <div className="flex-1 relative">
          <input
            type="text"
            placeholder={
              isEditing
                ? "Edit your comment..."
                : isReply
                ? "Write a reply..."
                : "Write a comment..."
            }
            className="w-full px-4 py-2.5 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 text-sm transition-all placeholder-gray-400 disabled:bg-gray-100 disabled:cursor-not-allowed"
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
            key={newFiles.length} // Force re-render
          />
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => !isSubmitting && fileInputRef.current?.click()}
            disabled={isSubmitting}
            className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            type="button"
            aria-label="Attach media"
          >
            <ImagePlus size={20} />
          </button>

  
          <button
            onClick={handleSubmit}
            disabled={isDisabled}
            className={`p-2 rounded-full transition-colors ${
              isSubmitting
                ? "bg-blue-100 text-blue-600"
                : "bg-blue-500 text-white hover:bg-blue-600"
            } disabled:opacity-50 disabled:cursor-not-allowed`}
            type="button"
            aria-label={isSubmitting ? "Submitting..." : "Submit comment"}
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

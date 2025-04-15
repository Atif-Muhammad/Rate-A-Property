import React, { useState, useRef, useEffect } from "react";
import { Image, Smile, UserPlus, MapPin, X, Trash2 } from "lucide-react";
import { APIS } from "../../config/Config";
import { arrayBufferToBase64 } from "../ReUsables/arrayTobuffer";
import { useNavigate } from "react-router-dom";
import { createPortal } from "react-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {useCreatePost, useUpdatePost} from '../hooks/ReactQuery.js'


export const NewPost = ({
  isOpen,
  onClose,
  editPostData = null,
  onPostUpdated,
}) => {
  const textRef = useRef(null);
  const fileInputRef = useRef(null);
  const [selectedMedia, setSelectedMedia] = useState([]);
  const [location, setLocation] = useState("Select Location");
  const [isPosting, setIsPosting] = useState(false);
  const navigate = useNavigate();

  const isEdit = !!editPostData;

  const createPostMutation = useCreatePost();
  const updatePostMutation = useUpdatePost();

  const { data: user = {}, isLoading } = useQuery({
    queryKey: ["user"],
    queryFn: async () => {
      const who = await APIS.userWho();
      const res = await APIS.getUser(who.data.id);
      const user = res.data;
      // console.log("user", res.data)
      return {
        id: user._id,
        image: user.image,
        user_name: user.user_name,
        posts: user.posts || [],
      };
    },
  });

  useEffect(() => {
    if (isEdit) {
      textRef.current.value = editPostData.description || "";
      setLocation(editPostData.location || "Select Location");

      const existingMedia = (editPostData.media || []).map((mediaItem) => ({
        file: null,
        url: typeof mediaItem === "string" ? mediaItem : mediaItem.url,
        existing: true,
      }));


      setSelectedMedia(existingMedia);
    }
  }, [editPostData]);

  const handleFileSelect = (event) => {
    const files = Array.from(event.target.files);
    const newMedia = files.map((file) => ({
      file,
      url: URL.createObjectURL(file),
    }));
    setSelectedMedia((prev) => [...prev, ...newMedia]);
  };

  const removeMedia = (index) => {
    setSelectedMedia((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSelectLocation = () => {
    const userLocation = prompt("Enter your location:");
    if (userLocation) setLocation(userLocation);
  };

  const handleSubmit = () => {
    setIsPosting(true);
    const formData = new FormData();
    // console.log(user)
    formData.append("owner", user.id);
    formData.append("description", textRef.current?.value);
    formData.append("location", location);

    // Only append new media files (not existing)
    selectedMedia.forEach((item) => {
      if (item.file) {
        formData.append(`files`, item.file);
      }
    });

    if (isEdit) {
      updatePostMutation.mutate(
        { postId: editPostData._id, formData },
        {
          onSuccess: () => {
            onPostUpdated?.();
            onClose();
          },
          onError: (err) => console.log(err),
          onSettled: () => setIsPosting(false),
        }
      );
    } else {
      createPostMutation.mutate(formData, {
        onSuccess: () => {
          navigate("/");
          onClose();
        },
        onError: (err) => console.log(err),
        onSettled: () => {
          setIsPosting(false)
        },
      });
    }
  };

  if (!isOpen) return null;

  return createPortal(
    <div
      className="fixed inset-0 bg-black/30 backdrop-blur-sm flex justify-center items-center z-50 p-6"
      onClick={onClose}
    >
      <div
        className="bg-white shadow-2xl rounded-2xl p-6 w-full max-w-2xl border border-gray-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex justify-between items-center border-b pb-4 mb-4">
          <h2 className="text-2xl text-center w-full font-bold text-gray-800">
            {isEdit ? "Edit Post" : "Create Post"}
          </h2>
          <button onClick={onClose} className="bg-gray-200 rounded-full p-1">
            <X size={20} />
          </button>
        </div>

        {/* Profile & Input */}
        <div className="flex items-center space-x-4 mb-4">
          {user.image && (
            <img
              src={`data:${user.image.contentType};base64,${arrayBufferToBase64(
                user.image.data.data
              )}`}
              alt="user profile"
              className="w-12 h-12 rounded-full border-2 border-blue-500"
            />
          )}
          <div>
            <p className="text-sm font-semibold text-gray-800">
              {user.user_name}
            </p>
            <button
              className="text-xs flex items-center text-gray-600 bg-gray-100 px-3 py-1 rounded-md hover:bg-gray-200"
              onClick={handleSelectLocation}
            >
              <MapPin className="w-4 h-4 mr-1" />
              {location}
            </button>
          </div>
        </div>

        <textarea
          ref={textRef}
          placeholder="What's on your mind?"
          className="w-full p-4 text-gray-700 text-sm rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none mb-4"
          rows="4"
        ></textarea>

        {/* Preview */}
        {selectedMedia.map((media, index) => {
          const mediaUrl = String(media.url); // ensure it's a string
          return (
            <div key={index} className="relative w-28 h-28 flex-shrink-0">
              {mediaUrl.endsWith(".mp4") ? (
                <video
                  src={mediaUrl}
                  controls
                  className="w-full h-full rounded-lg"
                />
              ) : (
                <img
                  src={mediaUrl}
                  alt="Selected"
                  className="w-full h-full object-cover rounded-lg"
                />
              )}
              <button
                onClick={() => removeMedia(index)}
                className="absolute top-1 right-1 bg-black/60 p-1 rounded-full text-white"
              >
                <Trash2 size={16} />
              </button>
            </div>
          );
        })}

        {/* File input */}
        <input
          type="file"
          accept="image/*,video/*"
          ref={fileInputRef}
          className="hidden"
          multiple
          onChange={handleFileSelect}
        />

        {/* Actions */}
        <div className="border-t pt-4 mb-6">
          <div className="text-center mb-4">
            <p className="text-sm text-gray-600 font-semibold tracking-wide">
              Add to your post
            </p>
          </div>
          <div className="flex justify-center gap-6">
            <button
              className="flex flex-col items-center gap-1 hover:bg-gray-100 p-3 rounded-xl transition w-24"
              onClick={() => fileInputRef.current.click()}
            >
              <Image className="text-green-500" size={26} />
              <span className="text-xs text-gray-700">Photo/Video</span>
            </button>
          </div>
        </div>

        <button
          onClick={handleSubmit}
          disabled={isPosting}
          className={`w-full text-white text-base font-semibold py-3 rounded-lg transition ${
            isPosting
              ? "bg-blue-300 cursor-not-allowed"
              : "bg-blue-500 hover:bg-blue-600"
          }`}
        >
          {isPosting
            ? isEdit
              ? "Updating..."
              : "Posting..."
            : isEdit
            ? "Update Post"
            : "Post"}
        </button>
      </div>
    </div>,
    document.body
  );
};


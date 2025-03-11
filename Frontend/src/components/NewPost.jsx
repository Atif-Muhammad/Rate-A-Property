import React, { useState, useRef, useEffect } from "react";
import { Image, Smile, UserPlus, MapPin, X, Trash2 } from "lucide-react";
import { APIS } from "../../config/Config";
import { arrayBufferToBase64 } from "../ReUsables/arrayTobuffer";
import { useNavigate } from "react-router-dom";
import { createPortal } from "react-dom";

export const NewPost = ({ isOpen, onClose }) => {
  const textRef = useRef(null);
  const fileInputRef = useRef(null);
  const [selectedMedia, setSelectedMedia] = useState([]);
  const [location, setLocation] = useState("Select Location");
  const [user, setUser] = useState({});
  const [isPosting, setIsPosting] = useState(false); // ✅ New state for button disable
  const navigate = useNavigate();

  useEffect(() => {
    APIS.userWho()
      .then((res) => {
        if (res.status === 200) {
          APIS.getUser(res.data.id)
            .then((res) => {
              setUser(res.data);
            })
            .catch((err) => console.log(err));
        }
      })
      .catch((err) => console.log(err));
  }, []);

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
    setIsPosting(true); // ✅ Disable button
    const formData = new FormData();
    formData.append("owner", user._id);
    formData.append("description", textRef.current?.value);
    formData.append("location", location);
    selectedMedia.forEach((element) => {
      formData.append(`files`, element.file);
    });

    APIS.createPost(formData)
      .then((res) => {
        if (res.status === 200) {
          navigate("/");
          onClose(); // ✅ Close modal after successful post
        }
      })
      .catch((err) => console.log(err))
      .finally(() => {
        setIsPosting(false); // ✅ Re-enable button
      });
  };

  if (!isOpen) return null;

  return createPortal(
    <div
      className="fixed inset-0 bg-white/30 backdrop-blur-sm bg-opacity-50 flex justify-center items-center p-4 z-50"
      onClick={onClose}
    >
      <div
        className="bg-white shadow-lg shadow-black rounded-lg p-4  md:max-w-xl w-full border border-gray-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex justify-between items-center border-b pb-2">
          <h2 className="text-lg font-semibold">Create Post</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:bg-gray-200 rounded-full p-1"
          >
            <X size={18} />
          </button>
        </div>

        {/* Profile & Input Box */}
        <div className="flex items-center space-x-3 my-3">
          {user.image && (
            <img
              src={`data:${user.image.contentType};base64,${arrayBufferToBase64(
                user.image.data.data
              )}`}
              alt="user profile"
              className="w-10 h-10 rounded-full border-2 border-blue-500"
            />
          )}
          <div>
            <p className="text-sm font-semibold">{user.user_name}</p>
            <button
              className="text-xs flex items-center text-gray-600 bg-gray-200 px-2 py-1 rounded-md"
              onClick={handleSelectLocation}
            >
              <MapPin className="w-3 h-3 mr-1" />
              {location}
            </button>
          </div>
        </div>

        {/* Post Input */}
        <textarea
          ref={textRef}
          placeholder="Say something about these photos..."
          className="w-full p-3 text-gray-700 text-sm rounded-md border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-300"
          rows="2"
        ></textarea>

        {/* Upload Preview */}
        {selectedMedia.length > 0 && (
          <div className="mt-3 overflow-x-auto whitespace-nowrap flex space-x-2 p-2 border rounded-md">
            {selectedMedia.map((media, index) => (
              <div key={index} className="relative w-24 h-24 flex-shrink-0">
                {media.file.type.startsWith("image/") ? (
                  <img
                    src={media.url}
                    alt="Selected"
                    className="w-full h-full object-cover rounded-md"
                  />
                ) : (
                  <video
                    src={media.url}
                    controls
                    className="w-full h-full rounded-md"
                  />
                )}
                <button
                  onClick={() => removeMedia(index)}
                  className="absolute top-1 right-1 bg-black/60 p-1 rounded-full text-white"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* File Input */}
        <input
          type="file"
          accept="image/,video/"
          ref={fileInputRef}
          className="hidden"
          multiple
          onChange={handleFileSelect}
        />

        {/* Add to Post */}
        <div className="border-t mt-3 pt-2">
          <p className="text-sm text-gray-600 mb-2">Add to your post</p>
          <div className="flex justify-between">
            <button
              className="flex items-center gap-1 hover:bg-gray-100 p-2 rounded-lg transition"
              onClick={() => fileInputRef.current.click()}
            >
              <Image className="text-green-500" size={20} />
            </button>
            <button className="flex items-center gap-1 hover:bg-gray-100 p-2 rounded-lg transition">
              <UserPlus className="text-blue-500" size={20} />
            </button>
            <button className="flex items-center gap-1 hover:bg-gray-100 p-2 rounded-lg transition">
              <Smile className="text-yellow-500" size={20} />
            </button>
            <button className="flex items-center gap-1 hover:bg-gray-100 p-2 rounded-lg transition">
              <MapPin className="text-red-500" size={20} />
            </button>
          </div>
        </div>

        {/* Post Button */}
        <button
          onClick={handleSubmit}
          disabled={isPosting} // ✅ Disable button when posting
          className={`w-full text-white text-sm font-medium py-2 rounded-md mt-3 transition ${
            isPosting
              ? "bg-blue-300 cursor-not-allowed"
              : "bg-blue-500 hover:bg-blue-600"
          }`}
        >
          {isPosting ? "Posting..." : "Post"} {/* ✅ Show loading text */}
        </button>
      </div>
    </div>,
    document.body
  );
};

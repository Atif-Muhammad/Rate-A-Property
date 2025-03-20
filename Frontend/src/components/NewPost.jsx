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
      className="fixed inset-0 bg-black/30 backdrop-blur-sm flex justify-center items-center z-50 p-6"
      onClick={onClose}
    >
      <div
        className="bg-white shadow-2xl rounded-2xl p-6 w-full max-w-2xl border border-gray-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex justify-between items-center border-b pb-4 mb-4">
          <h2 className="text-2xl text-center w-full font-bold text-gray-800">Create Post</h2>
          <button
            onClick={onClose}
            className="bg-gray-200 rounded-full p-1"
          >
            <X size={20} />
          </button>
        </div>

        {/* Profile & Input Box */}
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

        {/* Post Input */}
        <textarea
          ref={textRef}
          placeholder="What's on your mind?"
          className="w-full p-4 text-gray-700 text-sm rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none mb-4"
          rows="4"
        ></textarea>

        {/* Upload Preview */}
        {selectedMedia.length > 0 && (
          <div className="mt-4 overflow-x-auto whitespace-nowrap flex space-x-3 p-2 border rounded-md mb-4">
            {selectedMedia.map((media, index) => (
              <div key={index} className="relative w-28 h-28 flex-shrink-0">
                {media.file.type.startsWith("image/") ? (
                  <img
                    src={media.url}
                    alt="Selected"
                    className="w-full h-full object-cover rounded-lg"
                  />
                ) : (
                  <video
                    src={media.url}
                    controls
                    className="w-full h-full rounded-lg"
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
          accept="image/*,video/*"
          ref={fileInputRef}
          className="hidden"
          multiple
          onChange={handleFileSelect}
        />

        {/* Add to Post */}
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
            <button className="flex flex-col items-center gap-1 hover:bg-gray-100 p-3 rounded-xl transition w-24">
              <UserPlus className="text-blue-500" size={26} />
              <span className="text-xs text-gray-700">Tag People</span>
            </button>
            <button className="flex flex-col items-center gap-1 hover:bg-gray-100 p-3 rounded-xl transition w-24">
              <Smile className="text-yellow-500" size={26} />
              <span className="text-xs text-gray-700">Feeling</span>
            </button>
          </div>
        </div>

        {/* Post Button */}
        <button
          onClick={handleSubmit}
          disabled={isPosting}
          className={`w-full text-white text-base font-semibold py-3 rounded-lg transition ${
            isPosting
              ? "bg-blue-300 cursor-not-allowed"
              : "bg-blue-500 hover:bg-blue-600"
          }`}
        >
          {isPosting ? "Posting..." : "Post"}
        </button>
      </div>
    </div>,
    document.body
  );
};

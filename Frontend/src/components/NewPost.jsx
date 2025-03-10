import React, { useState, useRef, useEffect } from "react";
import { Image, Smile, UserPlus, MapPin, X, Trash2 } from "lucide-react";
import {APIS} from "../../config/Config"
import { arrayBufferToBase64 } from "../ReUsables/arrayTobuffer";
import { useNavigate } from "react-router-dom";

export const NewPost = () => {
  const textRef = useRef(null)
  const fileInputRef = useRef(null);
  const [selectedMedia, setSelectedMedia] = useState([]);
  const [location, setLocation] = useState("Select Location");
  const [user, setUser] = useState({});

  const navigate = useNavigate()

  // if (!isOpen) return null; // Hide modal when not open

  // Handle multiple file selection
  const handleFileSelect = (event) => {
    const files = Array.from(event.target.files);
    const newMedia = files.map((file) => ({
      file,
      url: URL.createObjectURL(file),
    }));
    setSelectedMedia((prev) => [...prev, ...newMedia]);
  };

  // Remove selected media
  const removeMedia = (index) => {
    setSelectedMedia((prev) => prev.filter((_, i) => i !== index));
  };

  // Handle location selection
  const handleSelectLocation = () => {
    const userLocation = prompt("Enter your location:");
    if (userLocation) setLocation(userLocation);
  };

  const formData = new FormData();
  formData.append("owner", user._id)
  formData.append("description", textRef.current?.value);
  formData.append("location", location);
  selectedMedia.forEach((element, index) => {
    formData.append(`files`, element.file); 
  });
  for (let [key, value] of formData.entries()) {
    console.log(`${key}:`, value);
  }
  const handleSubmit = ()=>{
    // console.log(formData)
    APIS.createPost(formData).then(res=>{
      // console.log(res)
      if(res.status === 200){
        navigate(-1)
      }
    }).catch(err=>{
      console.log(err)
    })
  }


  useEffect(() => {
    APIS.userWho()
      .then((res) => {
        if (res.status === 200) {
          APIS.getUser(res.data.id)
            .then((res) => {
              setUser(res.data);
            })
            .catch((err) => {
              console.log(err);
            });
        }
      })
      .catch((err) => {
        console.log(err);
      });
  }, []);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center p-4 z-50">
      <div className="bg-white shadow-lg rounded-lg p-4 w-full max-w-lg border border-gray-300">
        {/* Header */}
        <div className="flex justify-between items-center border-b pb-2">
          <h2 className="text-lg font-semibold">Create Post</h2>
          <button
            // onClick={onClose}
            className="text-gray-500 hover:bg-gray-200 rounded-full p-1"
          >
            <X size={18} />
          </button>
        </div>

        {/* Profile & Input Box */}
        <div className="flex items-center space-x-3 my-3">
          {user.image && <img
            src={`data:${user.image.contentType};base64,${arrayBufferToBase64(
              user.image.data.data
            )}`}
            alt="user profile"
            className="w-10 h-10 rounded-full border-2 border-blue-500"
          />}
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
        <button onClick={handleSubmit} className="w-full bg-blue-500 text-white text-sm font-medium py-2 rounded-md mt-3 hover:bg-blue-600 transition">
          Post
        </button>
      </div>
    </div>
  );
};

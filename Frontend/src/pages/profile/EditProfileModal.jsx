import React, { useState } from "react";
import { X } from "lucide-react";

export const EditProfileModal = ({ onClose, onSave, initialData }) => {
  const [name, setName] = useState(initialData.name);
  const [bio, setBio] = useState(initialData.bio);
  const [phone, setPhone] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({ name, bio });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-md">
      <div className="bg-white w-full sm:w-full md:w-full max-w-3xl rounded-3xl shadow-2xl relative max-h-[95vh] overflow-y-auto transition-all duration-300">
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-5 border-b">
          <h2 className="text-2xl font-bold text-center w-full text-gray-800">Edit Profile</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-red-500 transition"
          >
            <X size={26} />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Full Name */}
          <div className="space-y-1">
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Full Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full border border-gray-300 rounded-xl px-4 py-2.5 shadow-sm focus:ring-2 focus:ring-blue-400 focus:outline-none"
              placeholder="Enter your name"
            />
          </div>

          {/* Bio */}
          <div className="space-y-1">
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Bio
            </label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="w-full border border-gray-300 rounded-xl px-4 py-2.5 shadow-sm focus:ring-2 focus:ring-blue-400 focus:outline-none"
              rows="4"
              placeholder="Tell us about yourself..."
            ></textarea>
          </div>

          {/* Phone */}
          <div className="space-y-1">
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Phone
            </label>
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full border border-gray-300 rounded-xl px-4 py-2.5 shadow-sm focus:ring-2 focus:ring-blue-400 focus:outline-none"
              placeholder="Enter your phone number"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full bg-gradient-to-r from-blue-500 to-indigo-500 text-white py-3 rounded-2xl shadow-lg hover:opacity-90 transition text-lg font-semibold"
          >
            Save Changes
          </button>
        </form>
      </div>
    </div>
  );
};

import React, { useState } from "react";
import {
  ThumbsUp,
  ThumbsDown,
  MessagesSquare,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

export default function MediaGrid({ media }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [agrees, setAgrees] = useState([]);
  const [disagrees, setDisagrees] = useState([]);
  const agreeOwner = "user-id"; // Replace with actual user ID

  const MAX_VISIBLE = 4; // Number of media to show before "See More"

  const handleAgree = () => {
    if (agrees.some((agree) => agree.owner === agreeOwner)) {
      setAgrees(agrees.filter((agree) => agree.owner !== agreeOwner));
    } else {
      setAgrees([...agrees, { owner: agreeOwner }]);
      setDisagrees(
        disagrees.filter((disagree) => disagree.owner !== agreeOwner)
      );
    }
  };

  const handleDisagree = () => {
    if (disagrees.some((disagree) => disagree.owner === agreeOwner)) {
      setDisagrees(
        disagrees.filter((disagree) => disagree.owner !== agreeOwner)
      );
    } else {
      setDisagrees([...disagrees, { owner: agreeOwner }]);
      setAgrees(agrees.filter((agree) => agree.owner !== agreeOwner));
    }
  };

  // Handle swipe gestures
  let touchStartX = 0;
  let touchEndX = 0;
  const handleTouchStart = (e) => (touchStartX = e.touches[0].clientX);
  const handleTouchMove = (e) => (touchEndX = e.touches[0].clientX);
  const handleTouchEnd = () => {
    if (touchStartX - touchEndX > 50) nextMedia(); // Swipe Left
    if (touchEndX - touchStartX > 50) prevMedia(); // Swipe Right
  };

  // Next & Previous Media
  const nextMedia = () => setSelectedIndex((prev) => (prev + 1) % media.length);
  const prevMedia = () =>
    setSelectedIndex((prev) => (prev - 1 + media.length) % media.length);

  return (
    <>
      <div className="grid gap-2 py-2">
        {media.length >= 2 &&
        media[0].width > media[0].height &&
        media[1].width > media[1].height ? (
          <>
            {/* First 2 images (if both are landscape) in a row */}
            <div className="grid grid-cols-2 gap-2">
              {media.slice(0, 2).map((item, index) => (
                <div
                  key={index}
                  className="relative cursor-pointer"
                  onClick={() => {
                    setSelectedIndex(index);
                    setIsModalOpen(true);
                  }}
                >
                  <img
                    src={item.url}
                    alt="Post"
                    className="w-full h-auto rounded-lg object-cover"
                  />
                </div>
              ))}
            </div>

            {/* Remaining images in grid */}
            <div
              className={`grid gap-2 ${
                media.length - 2 === 1
                  ? "grid-cols-1"
                  : "grid-cols-2 md:grid-cols-3"
              }`}
            >
              {media.slice(2).map((item, index) => (
                <div
                  key={index + 2}
                  className="relative cursor-pointer"
                  onClick={() => {
                    setSelectedIndex(index + 2);
                    setIsModalOpen(true);
                  }}
                >
                  {item.type === "image" ? (
                    <img
                      src={item.url}
                      alt="Post"
                      className="w-full h-auto rounded-lg object-cover"
                    />
                  ) : (
                    <video controls className="w-full h-auto rounded-lg">
                      <source src={item.url} type="video/mp4" />
                    </video>
                  )}
                </div>
              ))}
            </div>
          </>
        ) : (
          // Default Grid Layout if first 2 are not both landscape
          <div
            className={`grid gap-2  ${
              media.length === 1
                ? "grid-cols-1"
                : media.length === 2
                ? "grid-cols-2 items-center"
                : "grid-cols-3 md:grid-cols-4 items-center"
            }`}
          >
            {media.slice(0, MAX_VISIBLE).map((item, index) => (
              <div
                key={index}
                className="relative cursor-pointer"
                onClick={() => {
                  setSelectedIndex(index);
                  setIsModalOpen(true);
                }}
              >
                {item.type === "image" ? (
                  <img
                    src={item.url}
                    alt="Post"
                    className="w-full h-auto rounded-lg object-cover"
                  />
                ) : (
                  <video controls className="w-full h-auto rounded-lg">
                    <source src={item.url} type="video/mp4" />
                  </video>
                )}
              </div>
            ))}
          </div>
        )}

        {/* "See More" Button */}
        {media.length > MAX_VISIBLE && (
          <div
            className="flex items-center px-3 py-1.5 justify-center bg-black/50 text-white text-md  rounded-lg cursor-pointer"
            onClick={() => setIsModalOpen(true)}
          >
            +{media.length - MAX_VISIBLE} See More
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center p-6 z-50">
          {/* Close Button (Top Right) */}
          <button
            className="absolute top-6 right-6 bg-red-600 hover:bg-red-700 z-10 text-white px-3 py-1.5 rounded-full transition"
            onClick={() => setIsModalOpen(false)}
          >
            ✕
          </button>

          {/* Next & Previous Buttons (Side Positions) */}
          {media.length > 1 && (
            <>
              {/* Next & Previous Buttons - Vertically Centered */}
              <button
                className="absolute md:left-2 left-0 top-1/2 -translate-y-1/2 z-10 bg-white hover:bg-gray-300 text-gray-700 md:p-3 p-1.5 rounded-full transition"
                onClick={prevMedia}
              >
                <ChevronLeft size={32} />
              </button>

              <button
                className="absolute md:right-2 right-0 top-1/2 -translate-y-1/2 z-10 bg-white hover:bg-gray-300 text-gray-700 md:p-3 p-1.5 rounded-full transition"
                onClick={nextMedia}
              >
                <ChevronRight size={32} />
              </button>
            </>
          )}

          <div className="relative bg-white rounded-xl p-6 max-w-4xl w-full max-h-[90vh] overflow-auto shadow-xl">
            {/* Media Display */}
            <div className="flex flex-col items-center">
              {media[selectedIndex].type === "image" ? (
                <img
                  src={media[selectedIndex].url}
                  alt="Post"
                  className="w-full max-h-[70vh] object-contain  rounded-lg shadow-md"
                />
              ) : (
                <video
                  controls
                  className="w-full max-h-[70vh] rounded-lg shadow-md"
                >
                  <source src={media[selectedIndex].url} type="video/mp4" />
                </video>
              )}

              {/* Footer Actions */}
              <div className="flex items-center gap-x-6 mt-4">
                <button className="flex items-center gap-x-2">
                  <ThumbsUp
                    size={32}
                    className="text-gray-500 hover:text-green-600"
                  />
                  <span className="text-lg font-semibold">0</span>
                </button>

                <button className="flex items-center gap-x-2">
                  <ThumbsDown
                    size={32}
                    className="text-gray-500 hover:text-red-600"
                  />
                  <span className="text-lg font-semibold">0</span>
                </button>

                <button className="flex items-center gap-x-2 hover:text-gray-700 transition">
                  <MessagesSquare size={24} />
                  <span className="text-lg font-medium hidden md:inline">
                    Comment
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

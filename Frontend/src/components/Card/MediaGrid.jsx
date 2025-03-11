import React, { useState, useEffect } from "react";
import { APIS } from "../../../config/Config";
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
  const [agreeOwner, setAgreeOwner] = useState("");

  const MAX_VISIBLE = 4; // Number of media to show before "See More"

  useEffect(() => {
    // console.log(media)
    APIS.userWho()
      .then((res) => setAgreeOwner(res.data.id))
      .catch((err) => console.log(err));
  }, []);

  useEffect(() => {
    // Update likes and dislikes when selected media changes
    setAgrees(media[selectedIndex]?.likes || []);
    setDisagrees(media[selectedIndex]?.disLikes || []);
  }, [selectedIndex, media]);

  const handleAgree = async (mediaId) => {
    if (agrees.some((agree) => agree.owner === agreeOwner)) {
      await APIS.unLikeMedia(mediaId);
      setAgrees((prev) => prev.filter((agree) => agree.owner !== agreeOwner));
    } else {
      await APIS.likeMedia(mediaId);
      setAgrees((prev) => [...prev, { owner: agreeOwner, of_post: mediaId }]);
  
      // Remove from disagrees if user had already disliked
      setDisagrees((prev) => {
        if (prev.some((disagree) => disagree.owner === agreeOwner)) {
          APIS.unDisLikeMedia(mediaId);
          return prev.filter((disagree) => disagree.owner !== agreeOwner);
        }
        return prev;
      });
    }
  };
  const handleDisagree = async (mediaId) => {
    if (disagrees.some((disagree) => disagree.owner === agreeOwner)) {
      await APIS.unDisLikeMedia(mediaId);
      setDisagrees((prev) => prev.filter((disagree) => disagree.owner !== agreeOwner));
    } else {
      await APIS.disLikeMedia(mediaId);
      setDisagrees((prev) => [...prev, { owner: agreeOwner, of_post: mediaId }]);
  
      // Remove from agrees if user had already liked
      setAgrees((prev) => {
        if (prev.some((agree) => agree.owner === agreeOwner)) {
          APIS.unLikeMedia(mediaId);
          return prev.filter((agree) => agree.owner !== agreeOwner);
        }
        return prev;
      });
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
              {media[selectedIndex]?.type === "image" ? (
                <>
                  <img
                    src={media[selectedIndex].url}
                    alt="Post"
                    className="w-full max-h-[70vh] object-contain rounded-lg shadow-md"
                  />
                </>
              ) : (
                <>
                  <video
                    controls
                    className="w-full max-h-[70vh] rounded-lg shadow-md"
                  >
                    <source src={media[selectedIndex].url} type="video/mp4" />
                  </video>
                </>
              )}

              <div className="flex items-center gap-x-6 mt-4">
                {/* Like Button */}
                <button
                  className="flex items-center gap-x-2"
                  onClick={() => handleAgree(media[selectedIndex]._id)}
                >
                  <ThumbsUp
                    size={32}
                    className={`hover:text-green-600 ${
                      agrees.some((a) => a.owner === agreeOwner)
                        ? "text-green-600"
                        : "text-gray-500"
                    }`}
                  />
                  <span className="text-lg font-semibold">({agrees.length})</span>
                </button>

                {/* Dislike Button */}
                <button
                  className="flex items-center gap-x-2"
                  onClick={() => handleDisagree(media[selectedIndex]._id)}
                >
                  <ThumbsDown
                    size={32}
                    className={`hover:text-red-600 ${
                      disagrees.some((d) => d.owner === agreeOwner)
                        ? "text-red-600"
                        : "text-gray-500"
                    }`}
                  />
                  <span className="text-lg font-semibold">
                    ({disagrees.length})
                  </span>
                </button>

                {/* Comment Button */}
                <button className="flex items-center gap-x-2 hover:text-gray-700 transition">
                  <MessagesSquare size={24} />
                  <span className="text-lg font-medium hidden md:inline">
                    Comment
                  </span>
                </button>
              </div>
              {/* Footer Actions */}
              {/* <div className="flex items-center gap-x-6 mt-4">
                <button className="flex items-center gap-x-2">
                  <ThumbsUp
                    size={32}
                    onClick={() => handleAgree(media._id)}
                    className="text-gray-500 hover:text-green-600"
                  />
                  <span className="text-lg font-semibold">0</span>
                </button>

                <button className="flex items-center gap-x-2">
                  <ThumbsDown
                    size={32}
                    onClick={() => handleDisagree(media._id)}
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
              </div> */}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

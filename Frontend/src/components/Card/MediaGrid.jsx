import React ,{ useState } from "react";
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
    <div>
      {/* Media Grid */}
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
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
                Your browser does not support the video tag.
              </video>
            )}
          </div>
        ))}

        {/* "See More" Button */}
        {media.length > MAX_VISIBLE && (
          <div
            className="flex items-center justify-center bg-black/50 text-white text-lg font-semibold rounded-lg cursor-pointer"
            onClick={() => setIsModalOpen(true)}
          >
            +{media.length - MAX_VISIBLE} See More
          </div>
        )}
      </div>
      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex justify-center items-center p-4 z-50">
          <div className="relative bg-white rounded-lg p-4 max-w-4xl w-full max-h-[90vh] overflow-auto">
            {/* Close Button */}
            <button
              className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full"
              onClick={() => setIsModalOpen(false)}
            >
              ✕
            </button>

            {/* Slider Controls */}
            <button
              className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-gray-700/60 text-white p-2 rounded-full"
              onClick={prevMedia}
            >
              <ChevronLeft size={28} />
            </button>

            <button
              className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-gray-700/60 text-white p-2 rounded-full"
              onClick={nextMedia}
            >
              <ChevronRight size={28} />
            </button>

            {/* Full-Width Media Display with Swipe Support */}
            <div
              className="flex flex-col items-center"
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
            >
              {media[selectedIndex].type === "image" ? (
                <img
                  src={media[selectedIndex].url}
                  alt="Post"
                  className="w-full max-h-[70vh] object-contain rounded-lg"
                />
              ) : (
                <video controls className="w-full max-h-[70vh] rounded-lg">
                  <source src={media[selectedIndex].url} type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
              )}

              {/* Footer Actions */}
              <div className="flex items-center gap-x-4 mt-3">
                <div className="flex items-center gap-x-2">
                  {/* Like Button */}
                  <div className="flex items-center justify-center gap-x-1">
                    <button onClick={handleAgree}>
                      <ThumbsUp
                        size={32}
                        className={`transition-transform ${
                          agrees.some((agree) => agree.owner === agreeOwner)
                            ? "text-green-700"
                            : "text-gray-500"
                        }`}
                      />
                    </button>
                    <span className="text-base font-medium">
                      {agrees.length}
                    </span>
                  </div>

                  {/* Dislike Button */}
                  <div className="flex items-center justify-center gap-x-1">
                    <button onClick={handleDisagree}>
                      <ThumbsDown
                        size={32}
                        className={`transition-transform ${
                          disagrees.some(
                            (disagree) => disagree.owner === agreeOwner
                          )
                            ? "text-red-500"
                            : "text-gray-500"
                        }`}
                      />
                    </button>
                    <span className="text-base font-medium">
                      {disagrees.length}
                    </span>
                  </div>
                </div>

                {/* Comment Button */}
                <button className="flex items-center md:gap-x-2 hover:text-gray-700 transition">
                  <MessagesSquare size={22} />
                  <span className="text-base hidden md:flex font-medium">
                    Comment
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
         
    </div>
  );
}

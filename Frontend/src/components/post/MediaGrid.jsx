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

  // Responsive visible count
  const [maxVisible, setMaxVisible] = useState(3); // Default desktop value

  useEffect(() => {
    // Set initial value based on window width
    const handleResize = () => {
      setMaxVisible(window.innerWidth < 768 ? 2 : 3);
    };

    // Set initial value
    handleResize();

    // Add event listener
    window.addEventListener("resize", handleResize);

    // Cleanup
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    APIS.userWho()
      .then((res) => setAgreeOwner(res.data.id))
      .catch((err) => console.log(err));
  }, []);

  useEffect(() => {
    setAgrees(media[selectedIndex]?.likes || []);
    setDisagrees(media[selectedIndex]?.disLikes || []);
  }, [selectedIndex, media]);

  // Media grid layout calculation - now responsive
  const getGridLayout = () => {
    const visibleCount = Math.min(media.length, maxVisible);

    if (visibleCount === 1) return "grid-cols-1";
    if (visibleCount === 2) return "grid-cols-2";
    return "grid-cols-3"; // For 3 items
  };

  // Card size classes - responsive
  const getCardSizeClass = () => {
    return "w-full h-48 sm:h-56 md:h-64 lg:h-72 xl:h-80"; // Responsive heights
  };


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
        setDisagrees((prev) =>
          prev.filter((disagree) => disagree.owner !== agreeOwner)
        );
      } else {
        await APIS.disLikeMedia(mediaId);
        setDisagrees((prev) => [
          ...prev,
          { owner: agreeOwner, of_post: mediaId },
        ]);

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

  return (
    <>
      <div className="grid gap-2 py-2">
        {/* Main media grid */}
        <div className={`grid ${getGridLayout()} gap-2`}>
          {media.slice(0, maxVisible).map((item, index) => (
            <div
              key={index}
              className={`relative overflow-hidden rounded-lg bg-gray-100 ${getCardSizeClass()}`}
              onClick={() => {
                setSelectedIndex(index);
                setIsModalOpen(true);
              }}
            >
              {item.type?.startsWith("image") ? (
                <img
                  src={item.url}
                  alt={`Media ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              ) : (
                <video controls className="w-full h-full object-cover">
                  <source src={item.url} type="video/mp4" />
                </video>
              )}
            </div>
          ))}
        </div>

        {/* "See More" Button - shows when there are more items than maxVisible */}
        {media.length > maxVisible && (
          <button
            className="w-full py-2 mt-2 bg-gray-200 hover:bg-gray-300 rounded-lg text-center"
            onClick={() => setIsModalOpen(true)}
          >
            +{media.length - maxVisible} See More
          </button>
        )}
      </div>

      {/* Modal View */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex justify-center items-center p-4 z-50">
          <button
            className="absolute top-4 right-4 bg-red-600 hover:bg-red-700 z-10 text-white px-2 py-1 rounded-full transition"
            onClick={() => setIsModalOpen(false)}
          >
            ✕
          </button>

          {media.length > 1 && (
            <>
              <button
                className="absolute left-4 top-1/2 -translate-y-1/2 z-10 bg-white/80 hover:bg-white text-gray-800 p-2 rounded-full transition"
                onClick={() =>
                  setSelectedIndex(
                    (prev) => (prev - 1 + media.length) % media.length
                  )
                }
              >
                <ChevronLeft size={32} />
              </button>
              <button
                className="absolute right-4 top-1/2 -translate-y-1/2 z-10 bg-white/80 hover:bg-white text-gray-800 p-2 rounded-full transition"
                onClick={() =>
                  setSelectedIndex((prev) => (prev + 1) % media.length)
                }
              >
                <ChevronRight size={32} />
              </button>
            </>
          )}

          <div className="relative w-full max-w-4xl max-h-[90vh] flex flex-col items-center">
            {media[selectedIndex]?.type.startsWith("image") ? (
              <img
                src={media[selectedIndex].url}
                alt="Enlarged media"
                className="max-w-full max-h-[80vh] object-contain"
              />
            ) : (
              <video controls className="max-w-full max-h-[80vh]" autoPlay>
                <source src={media[selectedIndex].url} type="video/mp4" />
              </video>
            )}

            <div className="flex items-center gap-6 mt-4 bg-white/10 p-3 rounded-lg">
              <button
                className="flex items-center gap-2"
                onClick={() => handleAgree(media[selectedIndex]._id)}
              >
                <ThumbsUp
                  size={24}
                  className={
                    agrees.some((a) => a.owner === agreeOwner)
                      ? "text-green-500"
                      : "text-gray-300"
                  }
                />
                <span className="text-white">{agrees.length}</span>
              </button>
              <button
                className="flex items-center gap-2"
                onClick={() => handleDisagree(media[selectedIndex]._id)}
              >
                <ThumbsDown
                  size={24}
                  className={
                    disagrees.some((d) => d.owner === agreeOwner)
                      ? "text-red-500"
                      : "text-gray-300"
                  }
                />
                <span className="text-white">{disagrees.length}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

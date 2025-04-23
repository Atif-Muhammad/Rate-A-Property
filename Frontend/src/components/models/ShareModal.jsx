import React, { useState } from "react";
import {
  FacebookShareButton,
  TwitterShareButton,
  EmailShareButton,
  LinkedinShareButton,
  TelegramShareButton,
} from "react-share";
import {
  FacebookIcon,
  TwitterIcon,
  WhatsappIcon,
  EmailIcon,
  LinkedinIcon,
  TelegramIcon,
} from "react-share";
import { X, Link as LinkIcon, Check, MoreHorizontal } from "lucide-react";
import { FaInstagram, FaTiktok } from "react-icons/fa";

const ShareModal = ({ post, onClose }) => {
  const shareUrl = `${window.location.origin}/post/${post._id}`;
  const title = post.description?.substring(0, 60) || "Check out this post";
  const shareMessage = `${title}\n${shareUrl}`;

  const [copied, setCopied] = useState(false);
  const [showMore, setShowMore] = useState(false);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const handleWhatsAppShare = () => {
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(
      shareMessage
    )}`;
    window.open(whatsappUrl, "_blank");
  };

  const handleTikTokShare = () => {
    window.open(
      `https://www.tiktok.com/share?url=${encodeURIComponent(shareUrl)}`,
      "_blank"
    );
  };

  const handleInstagramShare = () => {
    window.open(
      `https://www.instagram.com/?url=${encodeURIComponent(shareUrl)}`,
      "_blank"
    );
  };

  const allPlatforms = [
    {
      name: "Facebook",
      onClick: () => {
        window.open(
          `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
            shareUrl
          )}&quote=${encodeURIComponent(shareMessage)}`,
          "_blank"
        );
      },
      Icon: FacebookIcon,
      color: "#1877F2",
    },
    {
      name: "Twitter",
      onClick: () => {
        window.open(
          `https://twitter.com/intent/tweet?text=${encodeURIComponent(
            shareMessage
          )}`,
          "_blank"
        );
      },
      Icon: TwitterIcon,
      color: "#1DA1F2",
    },
    {
      name: "WhatsApp",
      onClick: handleWhatsAppShare,
      Icon: WhatsappIcon,
      color: "#25D366",
    },
    {
      name: "TikTok",
      onClick: handleTikTokShare,
      Icon: FaTiktok,
      color: "#000000",
    },
    {
      name: "Instagram",
      onClick: handleInstagramShare,
      Icon: FaInstagram,
      color: "#E1306C",
    },
    {
      name: "Telegram",
      onClick: () => {
        window.open(
          `https://t.me/share/url?url=${encodeURIComponent(
            shareUrl
          )}&text=${encodeURIComponent(shareMessage)}`,
          "_blank"
        );
      },
      Icon: TelegramIcon,
      color: "#0088CC",
    },
    {
      name: "LinkedIn",
      onClick: () => {
        window.open(
          `https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(
            shareUrl
          )}&title=${encodeURIComponent(
            shareMessage
          )}&summary=${encodeURIComponent(shareMessage)}`,
          "_blank"
        );
      },
      Icon: LinkedinIcon,
      color: "#0077B5",
    },
  ];


  const visible = showMore ? allPlatforms : allPlatforms.slice(0, 5);

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-fade-in">
        {/* Header */}
        <div className="flex justify-between items-center p-5 border-b">
          <h3 className="text-xl font-semibold text-gray-900">
            🔗 Share this post
          </h3>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-100 text-gray-500 hover:text-gray-700"
          >
            <X size={22} />
          </button>
        </div>

        {/* Sharing Buttons */}
        <div className="grid grid-cols-3 gap-5 p-6">
          {visible.map((platform, index) => (
            <div
              key={index}
              onClick={platform.onClick}
              className="cursor-pointer hover:scale-105 hover:shadow-md transition-all bg-gray-50 rounded-xl p-3 flex flex-col items-center"
            >
              <platform.Icon
                size={48}
                round
                bgStyle={{ fill: platform.color }}
                iconFillColor="white"
              />
              <span className="text-sm mt-2 font-medium text-gray-700">
                {platform.name}
              </span>
            </div>
          ))}

          {!showMore && (
            <button
              onClick={() => setShowMore(true)}
              className="cursor-pointer hover:scale-105 hover:shadow-md transition-all bg-gray-50 rounded-xl p-3 flex flex-col items-center"
            >
              <MoreHorizontal className="w-12 h-12 text-gray-600" />
              <span className="text-sm mt-2 font-medium text-gray-700">
                More
              </span>
            </button>
          )}
        </div>

        {/* Link Copy Section */}
        <div className="p-5 border-t bg-gray-100">
          <p className="text-sm font-semibold text-gray-800 mb-2">
            Or copy link manually
          </p>
          <div className="flex items-center gap-2">
            <div className="flex-1 flex items-center bg-white border border-gray-300 rounded-lg px-3 py-2">
              <LinkIcon className="text-gray-400 mr-2" size={16} />
              <input
                type="text"
                value={shareUrl}
                readOnly
                className="flex-1 bg-transparent text-sm outline-none text-gray-700 truncate"
              />
            </div>
            <button
              onClick={copyToClipboard}
              className={`${
                copied ? "bg-green-600" : "bg-blue-600 hover:bg-blue-700"
              } text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-1 transition-all`}
            >
              {copied ? (
                <>
                  <Check size={16} /> Copied
                </>
              ) : (
                "Copy"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShareModal;

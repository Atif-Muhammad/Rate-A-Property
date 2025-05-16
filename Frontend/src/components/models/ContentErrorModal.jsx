import React from "react";
import { createPortal } from "react-dom";

export const ContentErrorModal = ({ message, onClose }) => {
  // if (!isOpen) return null;

  return createPortal(
    <div
      className="fixed inset-0 bg-black/30 backdrop-blur-sm flex justify-center items-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl shadow-xl p-6 max-w-md w-full mx-4 text-center"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-xl font-semibold text-red-600 mb-4">
          Inappropriate Content
        </h2>
        <p className="text-gray-700 mb-6">
          {message}
        </p>
        <button
          onClick={onClose}
          className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg font-medium"
        >
          OK
        </button>
      </div>
    </div>,
    document.body
  );
};

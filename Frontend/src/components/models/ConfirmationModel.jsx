import React from "react";
import { X, Trash2 } from "lucide-react";
import { motion } from "framer-motion";
import { createPortal } from "react-dom";

export const ConfirmationModal = ({
  title,
  description,
  onCancel,
  onConfirm,
  button,
}) => {
  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: -20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: -20 }}
        transition={{ duration: 0.3 }}
        className="bg-white w-full max-w-sm lg:max-w-sm z-50 rounded-3xl shadow-2xl p-6 relative overflow-hidden"
      >
        {/* Accent Bar */}
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-red-500 to-pink-500 rounded-t-3xl"></div>

        {/* Header */}
        <div className="flex justify-between items-center mb-5">
          <h3 className="text-xl font-bold text-gray-800">{title}</h3>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-red-500 transition"
          >
            <X size={22} />
          </button>
        </div>

        {/* Body */}
        <div className="flex items-center space-x-4 mb-6">
          <div className="bg-red-100 text-red-600 p-3 rounded-2xl shadow-sm flex-shrink-0">
            <Trash2 size={24} />
          </div>
          <p className="text-gray-600 leading-relaxed text-base">
            {description}
          </p>
        </div>

        {/* Actions */}
        <div className="flex justify-end space-x-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 rounded-xl border border-gray-300 text-gray-700 hover:bg-gray-100 transition shadow-sm"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-5 py-2 rounded-xl bg-gradient-to-r from-red-500 to-pink-500 text-white font-medium hover:opacity-90 shadow-lg"
          >
            {button}
          </button>
        </div>
      </motion.div>
    </div>,
    document.body
  );
};

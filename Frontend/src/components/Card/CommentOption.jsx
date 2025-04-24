import React, { useState, useEffect, useRef } from "react";
import { MoreHorizontal, Trash2, Pencil } from "lucide-react";
import { ConfirmationModal } from "../models/ConfirmationModel";
import { motion, AnimatePresence } from "framer-motion";

export const CommentOptions = ({ onDelete, onEdit }) => {
  const [open, setOpen] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false); // Modal control
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleDelete = () => {
    setShowConfirm(true); // Open confirmation modal
    setOpen(false); // Close dropdown
  };

  const handleConfirmDelete = () => {
    onDelete(); // Call actual delete logic
    setShowConfirm(false); // Close modal
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <MoreHorizontal
        size={22}
        className="text-gray-500 cursor-pointer hover:text-black"
        onClick={() => setOpen(!open)}
      />

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 mt-2 w-44 z-50"
          >
            <div className="bg-white shadow-xl border border-gray-200 rounded-xl relative overflow-visible">
              <div className="absolute -top-2 right-2 w-3 h-3 bg-white rotate-45 border-l border-t border-gray-200 z-20 shadow-sm"></div>
              <ul className="py-2 relative z-10">
                <li
                  className="flex items-center px-4 py-2 text-sm hover:bg-gray-50 cursor-pointer gap-2 text-gray-800 transition-colors"
                  onClick={() => {
                    onEdit();
                    setOpen(false);
                  }}
                >
                  <Pencil size={16} /> Edit comment
                </li>
                <li
                  className="flex items-center px-4 py-2 text-sm hover:bg-gray-50 cursor-pointer gap-2 text-red-500 transition-colors"
                  onClick={handleDelete}
                >
                  <Trash2 size={16} /> Delete comment
                </li>
              </ul>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Confirmation Modal */}
      {showConfirm && (
        <ConfirmationModal
          title="Are you sure?"
          description="Do you really want to delete this comment?"
          onCancel={() => setShowConfirm(false)}
          onConfirm={handleConfirmDelete}
          button="Delete"
        />
      )}
    </div>
  );
};

import { useState, useEffect, useRef } from "react";

export const PostDescription = ({ description }) => {
  const [expanded, setExpanded] = useState(false);
  const [isClamped, setIsClamped] = useState(false);
  const descRef = useRef(null);

  useEffect(() => {
    const el = descRef.current;
    if (el) {
      setIsClamped(el.scrollHeight > el.clientHeight);
    }
  }, [description]);

  return (
    <div>
      <p
        ref={descRef}
        className={`text-gray-800 text-sm mt-4 transition-all duration-300 ${
          !expanded ? "line-clamp-3" : ""
        }`}
      >
        {description}
      </p>
      {isClamped && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="text-blue-600 text-sm font-semibold "
        >
          {expanded ? "See less" : "See more"}
        </button>
      )}
    </div>
  );
};

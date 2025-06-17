import React, { useEffect, useRef, useState } from "react";
import io from "socket.io-client";
import { APIS } from "../../../config/Config";

const Inbox = ({ currentUser, user, onBack }) => {
  const [messages, setMessages] = useState([]);
  const socketRef = useRef(null);
  const inputRef = useRef(null);
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const [isAtBottom, setIsAtBottom] = useState(true);

  useEffect(() => {
    socketRef.current = io("http://localhost:3000", {
      query: {
        currentUser: currentUser,
      },
    });

    socketRef.current.on("msgSent", (msg) => {
      setMessages((prev) => [...prev, msg]);
    });

    socketRef.current.on("newMsg", (msg) => {
      setMessages((prev) => [...prev, msg]);
    });

    return () => {
      socketRef.current?.off();
      socketRef.current?.disconnect();
      socketRef.current?.close();
    };
  }, []);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (isAtBottom) {
      scrollToBottom();
    }
  }, [messages]);

  // Check scroll position
  useEffect(() => {
    const container = messagesContainerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = container;
      const atBottom = scrollHeight - scrollTop <= clientHeight + 50; // 50px threshold
      setIsAtBottom(atBottom);
    };

    container.addEventListener("scroll", handleScroll);
    return () => container.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleEmit = () => {
    const message = inputRef.current?.value;

    if (message.trim() === "") return;

    if (socketRef.current) {
      socketRef.current.emit("sendMsg", {
        to: user.accB ? user.accB?._id : user?._id,
        from: currentUser,
        text: message,
      });
    }

    if (inputRef.current) {
      inputRef.current.value = "";
      inputRef.current.focus();
    }

    // Always scroll to bottom when sending a message
    setTimeout(scrollToBottom, 100);
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleEmit();
    }
  };

  const fetchMsgs = async () => {
    const payload = {
      currentUser,
      user: user._id,
    };
    await APIS.fetchMsgs(payload)
      .then((res) => {
        setMessages(res.data);
        // Scroll to bottom after initial messages load
        setTimeout(scrollToBottom, 100);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  useEffect(() => {
    fetchMsgs();
  }, [currentUser, user]);

  return (
    <div className="w-full md:h-[90vh] h-full flex flex-col bg-gray-100">
      {/* Header */}
      <div className="p-4 flex items-center gap-3 bg-white border-b shadow sticky top-0 z-20">
        <button onClick={onBack} className="text-xl font-bold">
          ←
        </button>
        <img
          src={user.image}
          alt={user.user_name}
          className="w-14 h-14 rounded-full object-cover border-2 border-blue-500"
        />
        <h3 className="font-semibold text-lg">{user.user_name}</h3>
      </div>

      {/* Messages */}
      <div
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto px-4 py-3 space-y-2"
      >
        {messages?.map((msg, index) => (
          <div
            key={index}
            className={`p-3 rounded-lg max-w-xs ${
              msg?.sender === currentUser
                ? "bg-blue-500 text-white ml-auto"
                : "bg-gray-200 text-gray-800"
            }`}
          >
            {msg?.content}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t bg-white sticky bottom-0 z-20">
        <div className="flex gap-2">
          <input
            type="text"
            ref={inputRef}
            className="flex-1 border border-gray-300 rounded-full px-4 py-2 outline-none"
            placeholder="Type a message..."
            onKeyPress={handleKeyPress}
          />
          <button
            onClick={handleEmit}
            className="bg-blue-500 text-white px-4 py-2 rounded-full"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
};

export default Inbox;

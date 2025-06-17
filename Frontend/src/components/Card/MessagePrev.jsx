import React from "react";
import { MoreHorizontal } from "lucide-react";

function MessagePrev({ chat, setSelectedUser, currentUser }) {
  // console.log(chat)
  // console.log(currentUser)
  const handleClick = () => {
    if (chat.messages) {
      // This is a chat
      setSelectedUser(chat.accB?._id === currentUser ? chat.accA : chat.accB);
    } else {
      // This is a follower/following
      setSelectedUser(chat);
    }
  };

  return (
    <div>
      {chat.messages ? (
        <div
          onClick={handleClick}
          className="bg-white hover:bg-gray-200 border border-gray-300 rounded-xl shadow hover:shadow-md cursor-pointer p-4 transition-all duration-200"
        >
          <div className="flex items-center gap-3">
            <div className="relative">
              {chat.accB?._id === currentUser ? (
                <img
                  src={chat.accA?.image}
                  alt={chat.accA?.user_name}
                  className="w-14 h-14 rounded-full object-cover border-2 border-blue-500"
                />
              ) : (
                <img
                  src={chat.accB?.image}
                  alt={chat.accB?.user_name}
                  className="w-14 h-14 rounded-full object-cover border-2 border-blue-500"
                />
              )}
              <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></span>
            </div>
            <div className="flex-1">
              <p className="font-semibold text-base">
                {chat.accB?._id === currentUser
                  ? chat.accA?.user_name
                  : chat.accB?.user_name}
              </p>
              <p className="text-sm text-gray-500 truncate">
                {chat?.messages[0]?.content}
              </p>
            </div>
            <MoreHorizontal className="text-gray-400 hover:text-black" />
          </div>
        </div>
      ) : (
        <div
          onClick={handleClick}
          className="bg-white hover:bg-gray-200 border border-gray-300 rounded-xl shadow hover:shadow-md cursor-pointer p-4 transition-all duration-200"
        >
          <div className="flex items-center gap-3">
            <div className="relative">
              <img
                src={chat.image}
                alt={chat.user_name}
                className="w-14 h-14 rounded-full object-cover border-2 border-blue-500"
              />
              <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></span>
            </div>
            <div className="flex-1">
              <p className="font-semibold text-base">{chat.user_name}</p>
            </div>
            <MoreHorizontal className="text-gray-400 hover:text-black" />
          </div>
        </div>
      )}
    </div>
  );
}

export default MessagePrev;

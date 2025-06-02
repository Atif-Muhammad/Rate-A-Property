import React, { useState } from "react";
import Inbox from "./UserInbox";
import { MoreHorizontal } from "lucide-react"; // Importing 3 dots icon

const dummyUsers = [
  {
    id: 1,
    name: "Ali Khan",
    lastMessage: "Hello!",
    image: "https://i.pravatar.cc/150?img=1",
  },
  {
    id: 2,
    name: "Sara Ahmed",
    lastMessage: "See you soon! ",
    image: "https://i.pravatar.cc/150?img=2",
  },
  {
    id: 3,
    name: "John Doe",
    lastMessage: "What's up?",
    image: "https://i.pravatar.cc/150?img=3",
  },
  {
    id: 6,
    name: "Zara Sheikh",
    lastMessage: "Meeting was great!",
    image: "https://i.pravatar.cc/150?img=4",
  },
  {
    id: 5,
    name: "Hamza Ali",
    lastMessage: "I'll send the files later tonight.",
    image: "https://i.pravatar.cc/150?img=5",
  },
];

export const Messages = () => {
  const [selectedUser, setSelectedUser] = useState(null);

  const handleBack = () => {
    setSelectedUser(null);
  };

  return (
    <div className="h-screen flex justify-center items-center w-full bg-gray-100">
      <div className="w-full max-w-3xl h-full bg-white shadow-lg rounded-md overflow-hidden">
        {!selectedUser ? (
          <div className="h-full overflow-y-auto p-4 no-scrollbar">
            <h2 className="text-2xl font-bold mb-4">Chats</h2>
            <div className="flex flex-col gap-1">
              {dummyUsers.map((user) => (
                <div
                  key={user.id}
                  onClick={() => setSelectedUser(user)}
                  className="bg-white hover:bg-gray-200 border border-gray-300 rounded-xl shadow hover:shadow-md cursor-pointer p-4 transition-all duration-200"
                >
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <img
                        src={user.image}
                        alt={user.name}
                        className="w-14 h-14 rounded-full object-cover border-2 border-blue-500"
                      />
                      <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></span>
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-base">{user.name}</p>
                      <p className="text-sm text-gray-500 truncate">
                        {user.lastMessage}
                      </p>
                    </div>
                    <MoreHorizontal className="text-gray-400 hover:text-black" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <Inbox user={selectedUser} onBack={handleBack} />
        )}
      </div>
    </div>
  );
};

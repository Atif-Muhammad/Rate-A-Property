import React, { useState } from "react";
import Inbox from "./UserInbox";
import { useLocation } from "react-router-dom";
import { APIS } from "../../../config/Config";
import MessagePrev from "../../components/Card/MessagePrev";
import { X } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { ChatsSkeleton } from "../../components/skeletons/ChatsSkeleton";

export const Messages = () => {
  const location = useLocation();
  const [selectedUser, setSelectedUser] = useState(null);
  const [showFriends, setShowFriends] = useState(false);
  const [followers, setFollowers] = useState([]);
  const [following, setFollowing] = useState([]);
  const [isLoadingFriends, setIsLoadingFriends] = useState(false);
  const { currentUser } = location.state;

  const getFriends = async () => {
    setIsLoadingFriends(true);
    try {
      const res = await APIS.getFriends(currentUser?._id);
      setFollowers(res.data.finalFollowers);
      setFollowing(res.data.finalFollowing);
    } catch (err) {
      console.log(err);
    } finally {
      setIsLoadingFriends(false);
    }
  };

  const handleNewChatClick = async () => {
    setShowFriends(true); // Open modal immediately
    await getFriends(); // Load friends data
  };

  const getChats = async () => {
    try {
      const res = await APIS.getChats(currentUser?._id);
      return res.data;
    } catch (err) {
      console.log(err);
      return [];
    }
  };

  const { data: chats, isLoading } = useQuery({
    queryKey: ["chats", currentUser?._id],
    queryFn: getChats,
    enabled: !!currentUser?._id,
  });

  const handleBack = () => {
    setSelectedUser(null);
  };

  return (
    <div className="h-screen flex justify-center items-center w-full bg-gray-100">
      <div className="w-full max-w-3xl h-full bg-white shadow-lg rounded-md overflow-hidden relative">
        {!selectedUser ? (
          <div className="h-full overflow-y-auto no-scrollbar">
            <div className="w-full border-b p-4 flex items-start justify-between">
              <h2 className="text-2xl font-bold">All Chats</h2>
              <button
                onClick={handleNewChatClick}
                className="px-4 py-1.5 text-white bg-blue-600 hover:bg-blue-700 rounded-md text-sm transition"
              >
                New Chats
              </button>
            </div>

            <div className="flex flex-col p-4 gap-1">
              {isLoading ? (
                <>
                  <ChatsSkeleton />
                  <ChatsSkeleton />
                  <ChatsSkeleton />
                </>
              ) : chats?.length > 0 ? (
                chats.map((chat, index) => (
                  <MessagePrev
                    key={`${index}+${chat._id}`}
                    chat={chat}
                    currentUser={currentUser?._id}
                    setSelectedUser={setSelectedUser}
                  />
                ))
              ) : (
                <div className="w-full h-full grid place-items-center">
                  No chats found
                </div>
              )}
            </div>
          </div>
        ) : (
          <Inbox
            currentUser={currentUser?._id}
            user={selectedUser}
            onBack={handleBack}
          />
        )}

        {/* Friends Modal */}
        {showFriends && (
          <div className="absolute top-0 left-0 w-full h-full bg-white shadow-xl rounded-xl  overflow-y-auto z-50">
            <div className="flex justify-between items-center px-5 py-4 border-b">
              <h3 className="text-xl font-semibold">Select a Friend</h3>
              <X
                className="w-6 h-6 cursor-pointer text-gray-700 hover:text-red-500"
                onClick={() => setShowFriends(false)}
              />
            </div>

            <div className="px-5 py-3">
              <p className="text-gray-600 font-medium mb-2">Following</p>
              <div className="flex flex-col gap-2 mb-4">
                {isLoadingFriends ? (
                  <>
                    <ChatsSkeleton />
                    <ChatsSkeleton />
                  </>
                ) : following?.length > 0 ? (
                  following.map((follow, index) => (
                    <MessagePrev
                      key={`${index}+${follow._id}`}
                      chat={follow}
                      currentUser={currentUser?._id}
                      setSelectedUser={(user) => {
                        setSelectedUser(user);
                        setShowFriends(false);
                      }}
                    />
                  ))
                ) : (
                  <div className="text-gray-500">No following found</div>
                )}
              </div>

              <p className="text-gray-600 font-medium mb-2">Followers</p>
              <div className="flex flex-col gap-2">
                {isLoadingFriends ? (
                  <>
                    <ChatsSkeleton />
                    <ChatsSkeleton />
                  </>
                ) : followers?.length > 0 ? (
                  followers.map((follower, index) => (
                    <MessagePrev
                      key={`${index}+${follower._id}`}
                      chat={follower}
                      currentUser={currentUser?._id}
                      setSelectedUser={(user) => {
                        setSelectedUser(user);
                        setShowFriends(false);
                      }}
                    />
                  ))
                ) : (
                  <div className="text-gray-500">No followers found</div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

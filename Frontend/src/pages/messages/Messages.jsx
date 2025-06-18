import React, { useEffect, useState } from "react";
import Inbox from "./UserInbox";
import ProfileCard from "../../components/Card/ProfileCard";
import { useLocation } from "react-router-dom";
import { APIS } from "../../../config/Config";
import MessagePrev from "../../components/Card/MessagePrev";
import { X } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

export const Messages = () => {
  const location = useLocation();

  const [selectedUser, setSelectedUser] = useState(null);
  const [showFriends, setShowFriends] = useState(false);
  const [followers, setFollowers] = useState([]);
  const [following, setFollowing] = useState([]);
  // const [chats, setChats] = useState([]);
  const { currentUser } = location.state;
  // get the current user's friends
  const getFriends = async () => {
    await APIS.getFriends(currentUser?._id)
      .then((res) => {
        // console.log(res.data)
        setFollowers(res.data.finalFollowers);
        setFollowing(res.data.finalFollowing);
        // console.log("followers:", followers);
        // console.log("following:", following)
        setShowFriends(true);
      })
      .catch((err) => {
        console.log(err);
      });
  };


  const getChats = async ()=>{
    return await APIS.getChats(currentUser?._id).then(res=>{
      // console.log(res.data);
      // setChats(res.data)
      return res.data
    }).catch(err=>{
      // console.log(err)
      return err
    })
  }

  const {data: chats} = useQuery({
    queryKey: ["chats", currentUser?._id],
    queryFn: getChats,
    enabled: !!currentUser?._id,

  })

  const handleBack = () => {
    setSelectedUser(null);
  };
  useEffect(() => {
    // console.log("current user: ", currentUser);
  }, []);


  return (
    <div className="h-screen flex justify-center  items-center w-full bg-gray-100">
      <div className="w-full max-w-3xl h-full bg-white shadow-lg rounded-md overflow-hidden relative">
        {!selectedUser ? (
          <div className="h-full overflow-y-auto p-4 no-scrollbar">
            <div className="w-full flex items-start justify-between">
              <h2 className="text-2xl font-bold mb-4">All Chats</h2>
              <button
                onClick={getFriends}
                className="px-4 py-1.5 text-white bg-blue-600 hover:bg-blue-700 rounded-md text-sm transition"
              >
                New Chats
              </button>
            </div>
            <div className="flex flex-col gap-1">
              {chats?.length > 0 ? (
                chats?.map((chat, index) => (
                  <MessagePrev
                    key={`${index}+${chat._id}`}
                    chat={chat}
                    currentUser={currentUser?._id}
                    setSelectedUser={setSelectedUser}
                  />
                ))
              ) : (
                <div className="w-full h-full grid place-items-center">
                  No chats
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
      </div>

      {/* Modal (AOS-like) */}
      {showFriends && (
        <div className="absolute   w-full max-w-3xl h-full bg-white shadow-xl rounded-xl transform  p-5 overflow-y-auto z-50 transition-all duration-300">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-semibold">Select a Friend</h3>
            <X
              className="w-6 h-6 cursor-pointer text-gray-700 hover:text-red-500"
              onClick={() => setShowFriends(false)}
            />
          </div>

          <div>
            <p className="text-gray-600 font-medium mb-2">Following</p>
            <div className="flex flex-col gap-2 mb-4">
              {following?.map((follow, index) => (
                <MessagePrev
                  key={`${index}+${follow._id}`}
                  chat={follow}
                  currentUser={currentUser?._id}
                  setSelectedUser={(user) => {
                    setSelectedUser(user);
                    setShowFriends(false);
                  }}
                />
              ))}
            </div>

            <p className="text-gray-600 font-medium mb-2">Followers</p>
            <div className="flex flex-col gap-2">
              {followers?.map((follower, index) => (
                <MessagePrev
                  key={`${index}+${followers._id}`}
                  chat={followers}
                  currentUser={currentUser?._id}
                  setSelectedUser={(user) => {
                    setSelectedUser(user);
                    setShowFriends(false);
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

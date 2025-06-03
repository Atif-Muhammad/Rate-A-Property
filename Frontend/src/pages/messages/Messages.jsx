import React, { useEffect, useState } from "react";
import Inbox from "./UserInbox";
import ProfileCard from "../../components/Card/ProfileCard"
import { useLocation } from "react-router-dom";
import { APIS } from "../../../config/Config";
import MessagePrev from "../../components/Card/MessagePrev";



export const Messages = () => {
  const location = useLocation();

  const [selectedUser, setSelectedUser] = useState(null);
  const [showFriends, setShowFriends] = useState(false)
  const [followers, setFollowers] = useState([])
  const [following, setFollowing] = useState([])
  const { currentUser } = location.state;
  // get the current user's friends
  const getFriends = async () => {
    await APIS.getFriends(currentUser?._id).then(res => {
      // console.log(res.data)
      setFollowers(res.data.finalFollowers);
      setFollowing(res.data.finalFollowing);
      // console.log("followers:", followers);
      // console.log("following:", following)
      setShowFriends(true)
    }).catch(err => {
      console.log(err)
    })
  }

  const handleBack = () => {
    setSelectedUser(null);
  };
  useEffect(() => {
    console.log("current user: ", currentUser)
  }, [])

  const dummyUsers = [
    {
      _id: 1,
      user_name: "Ali Khan",
      lastMessage: "Hello!",
      image: "https://i.pravatar.cc/150?img=1",
    },
    {
      _id: 2,
      user_name: "Sara Ahmed",
      lastMessage: "See you soon! ",
      image: "https://i.pravatar.cc/150?img=2",
    },
    
  ];


  return (
    <div className="h-screen flex justify-center items-center w-full bg-gray-100">
      <div className="w-full max-w-3xl h-full bg-white shadow-lg rounded-md overflow-hidden">
        {!selectedUser ? (
          <div className="h-full overflow-y-auto p-4 no-scrollbar ">
            <div className="w-full flex items-start justify-between">
              <h2 className="text-2xl font-bold mb-4">Chats</h2>
              <p className="cursor-pointer" onClick={getFriends}>New</p>
            </div>
            <div className="flex flex-col gap-1">
              {dummyUsers.map((user, index)=>(
                <MessagePrev key={`${index}+${user.id}`} user={user} setSelectedUser={setSelectedUser} />
              ))}
            </div>
          </div>
        ) : (
          <Inbox currentUser={currentUser?._id} user={selectedUser} onBack={handleBack} />
        )}
      </div>

      {showFriends && (
        <div className="absolute w-1/2 h-2/3 bg-green-300 flex flex-col">
          <div className="cursor-pointer" onClick={() => setShowFriends(false)}>Cross</div>
          Following
          {following?.map((follow, index) => (<MessagePrev key={`${index}+${follow._id}`} user={follow} setSelectedUser={setSelectedUser} />))}

          Followers
          {followers?.map((follower, index) => (<MessagePrev key={`${index}+${follower._id}`} user={follower} setSelectedUser={setSelectedUser} />))}

        </div>
      )}
    </div>
  );
};

import React from "react";
import { MoreHorizontal, Circle } from "lucide-react";

export const Notifications = () => {
  const notifications = [
    {
      id: 1,
      name: "Anthony Stiff",
      message:
        "replied to your post on Property : 15 Greenfield Road, Birmingham, B15 2TU that you are following",
      time: "2h ago",
      type: "new",
    },
    {
      id: 2,
      name: "Stoat Broad",
      message:
        "replied to your post on Property : 15 Greenfield Road, Birmingham, B15 2TU that you are following",
      time: "12h ago",
      type: "new",
    },
    {
      id: 3,
      name: "Will Stark",
      message:
        "replied to your post on Property : 15 Greenfield Road, Birmingham, B15 2TU that you are following",
      time: "15h ago",
      type: "new",
    },
    {
      id: 4,
      name: "Jam Brouch",
      message:
        "replied to your post on Property : 15 Greenfield Road, Birmingham, B15 2TU that you are following",
      time: "1 Day ago",
      type: "yesterday",
    },
    {
      id: 5,
      name: "Will Stark",
      message:
        "replied to your post on Property : 15 Greenfield Road, Birmingham, B15 2TU that you are following",
      time: "1 Day ago",
      type: "yesterday",
    },
  ];

  return (
    <div className=" flex p-4 w-full bg-gray-100 overflow-y-auto  ">
      <div className="max-w-3xl mx-auto w-full space-y-8">
        {/* Header */}
        <div className="flex justify-between items-center">
          <h2 className="font-bold text-3xl">Notifications</h2>
          <MoreHorizontal className="text-gray-600 cursor-pointer" />
        </div>

        {/* New Notifications */}
        <div className="space-y-6">
          <div className="flex justify-between items-center mb-1">
            <h3 className="text-sm font-semibold text-gray-600 uppercase">
              New
            </h3>
            <span className="text-xs text-blue-600 cursor-pointer hover:underline">
              See all
            </span>
          </div>

          {notifications
            .filter((n) => n.type === "new")
            .map((n) => (
              <div
                key={n.id}
                className="relative flex items-start bg-white p-5 rounded-2xl shadow-sm hover:shadow-lg transition group border-b"
              >
                {/* Initials */}
                <div className="bg-gradient-to-r from-purple-500 to-indigo-500 text-white rounded-full w-12 h-12 flex items-center justify-center font-bold text-lg shadow mr-4">
                  {n.name[0]}
                </div>

                {/* Content */}
                <div className="text-left flex-1 space-y-1">
                  <p className="text-gray-900 text-[15px] leading-snug">
                    <span className="font-semibold">{n.name}</span> {n.message}
                  </p>
                  <span className="text-xs text-gray-400">{n.time}</span>
                </div>

                {/* 3-dots icon */}
                <div className="ml-2">
                  <MoreHorizontal className="text-gray-400 cursor-pointer hover:text-gray-600" />
                </div>
              </div>
            ))}
        </div>

        {/* Yesterday Notifications */}
        <div className="space-y-6 pt-2">
          <h3 className="text-sm font-semibold text-gray-600 uppercase mb-1">
            Yesterday
          </h3>
          {notifications
            .filter((n) => n.type === "yesterday")
            .map((n) => (
              <div
                key={n.id}
                className="relative flex items-start bg-white p-5 rounded-2xl shadow-sm hover:shadow-lg transition group border-b"
              >
                {/* Initials */}
                <div className="bg-gray-300 text-black rounded-full w-12 h-12 flex items-center justify-center font-bold text-lg shadow mr-4">
                  {n.name[0]}
                </div>

                {/* Content */}
                <div className="text-left flex-1 space-y-1">
                  <p className="text-gray-900 text-[15px] leading-snug">
                    <span className="font-semibold">{n.name}</span> {n.message}
                  </p>
                  <span className="text-xs text-gray-400">{n.time}</span>
                </div>

                {/* 3-dots icon */}
                <div className="ml-2">
                  <MoreHorizontal className="text-gray-400 cursor-pointer hover:text-gray-600" />
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
};

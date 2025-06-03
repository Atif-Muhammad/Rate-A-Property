import React from 'react'
import { MoreHorizontal } from "lucide-react";


function MessagePrev({ user, setSelectedUser }) {
    return (
        <div>
            <div
                key={user._id}
                onClick={() => setSelectedUser(user)}
                className="bg-white hover:bg-gray-200 border border-gray-300 rounded-xl shadow hover:shadow-md cursor-pointer p-4 transition-all duration-200"
            >
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <img
                            src={user.image}
                            alt={user.user_name}
                            className="w-14 h-14 rounded-full object-cover border-2 border-blue-500"
                        />
                        <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></span>
                    </div>
                    <div className="flex-1">
                        <p className="font-semibold text-base">{user.user_name}</p>
                        <p className="text-sm text-gray-500 truncate">
                            {user.lastMessage}
                        </p>
                    </div>
                    <MoreHorizontal className="text-gray-400 hover:text-black" />
                </div>
            </div>
        </div>
    )
}

export default MessagePrev
import React from "react";

const Inbox = ({ user, onBack }) => {
  const messages = [
    { from: "other", text: "Hi, how can I help you?" },
    { from: "me", text: "I'm interested in your services." },
    { from: "other", text: "Great! What kind of service are you looking for?" },
    { from: "me", text: "Mostly UI/UX design and a bit of development." },
    { from: "other", text: "Awesome. Can you share your project details?" },
    { from: "me", text: "Sure, I’ll send over the document shortly." },
    { from: "other", text: "Looking forward to it!" },
    {
      from: "me",
      text: "Also, do you have experience with React and Tailwind?",
    },
    { from: "other", text: "Yes, I’ve worked on several projects using both." },
    { from: "me", text: "Perfect. I think you’d be a great fit!" },
    {
      from: "other",
      text: "Thanks! I’ll be happy to help. When do you plan to start?",
    },
    {
      from: "me",
      text: "As soon as next week. I’m just finalizing the scope.",
    },
    {
      from: "other",
      text: "Cool. Just send me the final scope and we’ll get started.",
    },
    {
      from: "me",
      text: "Alright. One last thing – are you comfortable working with APIs?",
    },
    { from: "other", text: "Absolutely. REST, GraphQL – whatever’s needed." },
    {
      from: "me",
      text: "That’s great to hear. Let me finalize everything and I’ll ping you soon.",
    },
    { from: "other", text: "Sounds good! Speak soon." },
  ];

  return (
    <div className="w-full h-full flex flex-col bg-gray-100">
      {/* Fixed Header */}
      <div className="p-4 flex items-center gap-3 bg-white border-b shadow sticky top-0 z-20">
        <button onClick={onBack} className="text-xl font-bold">
          ←
        </button>
        <img
          src={user.image}
          alt={user.name}
          className="w-10 h-10 rounded-full"
        />
        <h3 className="font-semibold text-lg">{user.name}</h3>
      </div>

      {/* Scrollable Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`p-3 rounded-lg max-w-xs ${
              msg.from === "me"
                ? "bg-blue-500 text-white ml-auto"
                : "bg-white text-gray-800"
            }`}
          >
            {msg.text}
          </div>
        ))}
      </div>

      {/* Fixed Input */}
      <div className="p-4 border-t bg-white sticky bottom-0 z-20">
        <div className="flex gap-2">
          <input
            type="text"
            className="flex-1 border border-gray-300 rounded-full px-4 py-2 outline-none"
            placeholder="Type a message..."
          />
          <button className="bg-blue-500 text-white px-4 py-2 rounded-full">
            Send
          </button>
        </div>
      </div>
    </div>
  );
};

export default Inbox;

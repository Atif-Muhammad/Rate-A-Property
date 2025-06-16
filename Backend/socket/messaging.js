const { saveMsg, createChat } = require("../controllers/messageController");
const { checkChat } = require("../controllers/messageController");

module.exports = handleMessaging = (io) => {
  io.on("connection", (socket) => {
    console.log("a user connected with id:", socket.id);
    const user_id = socket.handshake.query.currentUser;
    // console.log(user_id)
    if (user_id) {
      socket.join(user_id);
      createChat;
    }

    socket.on("sendMsg", async ({ to, from, text }) => {
      // check user is online?????
      const userOnline = socket.adapter.rooms.has(to);

      // check and create chat for both parties
      const chatFound = await checkChat({ to, from });
      // console.log("chat found:",chatFound)
      // create chat for both parties
      let chat_id = null;
      if (chatFound) {
        chat_id = chatFound._id;
      } else {
        const chatt = await createChat({ to, from });
        // console.log(chatt);
        chat_id = chatt._id;
      }

      // console.log(userOnline)
      const message = { sender: from, content: text, timestamp: Date.now() };
      if (userOnline) {
        io.to(to).emit("newMsg", message);
        io.to(from).emit("msgSent", message);
        // save to db
        saveMsg({
          chat_id,
          to: to,
          ...message,
        });
      } else {
        io.to(from).emit("msgSent", message);
        // save to db only
        saveMsg({
          chat_id,
          to: to,
          ...message,
        });
      }

      // console.log(`Received message ${message} from user ${payload.sender} to ${payload.receiver}`)
    });

    socket.on("disconnect", () => {
      console.log("user disconnected", socket.id);
    });
  });
};

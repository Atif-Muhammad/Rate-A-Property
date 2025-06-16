const msg = require("../models/MessageModel");
const chat = require("../models/chatModel");

const checkChat = async ({ to, from }) => {
  try {
    const found = await chat.findOne({
      $or: [
        { accA: from, accB: to },
        { accA: to, accB: from },
      ],
    });
    //   console.log(found)
    return found;
  } catch (error) {
    return error;
  }
};

const createChat = async ({ to, from }) => {
  try {
    const data = {
      accA: from,
      accB: to,
    };
    const chatt = await chat.create(data);
    return chatt;
  } catch (error) {
    return error;
  }
};

const saveMsg = async (payload) => {
  // console.log(payload);

  const msgData = {
    sender: payload.sender,
    receiver: payload.to,
    content: payload.content,
  };

  try {
    const createdMsg = await msg.create(msgData);
    // console.log(createdMsg)
    const updatedChat = await chat.updateOne(
      { _id: payload.chat_id },
      { $push: { messages: createdMsg._id } }
    );
    return updatedChat;
  } catch (error) {
    return error;
  }
};

const getMsgs = async (req, res) => {
  const data = req.body.body;
  const { currentUser, user } = data;
  console.log(`current: ${currentUser} |||| user: ${user}`)
  // console.log(user)
  try {
    const msgs = await msg.find({ $or: [{sender: currentUser, receiver: user}, {sender: user, receiver: currentUser}] });
    console.log(msgs)
    res.send(msgs);
  } catch (error) {
    res.send(error);
  }
};

const getChats = async (req, res) => {
  const { userId } = req.query;
  // console.log(userId)

  // check for user id's chats
  try {
    const chats = await chat
      .find({ $or: [{ accA: userId }, { accB: userId }] }).select("messages")
      .populate({
        path: "accB",
        select: "user_name image",
      }).populate({
        path: "accA",
        select: "user_name image",
      }).populate({
        path: "messages",
        select: "content"
      })
    const finalChats = chats.map((cht) => {
      const chatObj = cht.toObject();

      // Only modify accB.image if it exists
      if (chatObj.accB?.image?.data) {
        chatObj.accB.image = `data:image/png;base64,${chatObj.accB.image.data.toString(
          "base64"
        )}`;
      }
       if (chatObj.accA?.image?.data) {
        chatObj.accA.image = `data:image/png;base64,${chatObj.accA.image.data.toString(
          "base64"
        )}`;
      }


      return chatObj;
    });

    res.send(finalChats)
  } catch (error) {
    res.send(error);
  }
};

module.exports = {
  checkChat,
  createChat,
  saveMsg,
  getMsgs,
  getChats,
};

const msg = require("../models/MessageModel");

const saveMsg = async (payload) => {
    // console.log(payload);

    const data = {
        sender: payload.from,
        receiver: payload.to,
        content: payload.text
    }

    try {
        await msg.create(data);
        return "done";
    } catch (error) {
        return error
    }
}

const getMsgs = async (req, res) => {
    const data = req.body.body;
    const { currentUser, user } = data;
    // console.log(user)
    try {
        const msgs = await msg.find({sender: currentUser, receiver: user})
        res.send(msgs);
    } catch (error) {
        res.send(error);
    }
}

module.exports = {
    saveMsg,
    getMsgs
}
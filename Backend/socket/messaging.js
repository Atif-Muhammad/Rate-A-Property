const { saveMsg } = require("../controllers/messageController");



module.exports = handleMessaging = (io) => {

    io.on("connection", (socket)=>{
        console.log("a user connected with id:", socket.id);
        const user_id = socket.handshake.query.currentUser;
        // console.log(user_id)
        if(user_id){
            socket.join(user_id);
        }

        socket.on("sendMsg", ({ to, from, text })=>{

            // check user is online?????
            const userOnline = socket.adapter.rooms.has(to);
            // console.log(userOnline)
            const message = { from, text, timestamp: Date.now() };
            if(userOnline){
                io.to(to).emit("newMsg", message)
                io.to(from).emit("msgSent", message)
                // save to db
                saveMsg({
                    to: to,
                    ...message
                });
            }else{
                io.to(from).emit("msgSent", message)
                // save to db only
                saveMsg({
                    to: to,
                    ...message
                });

            }
            
            // console.log(`Received message ${message} from user ${payload.sender} to ${payload.receiver}`)
        })

        socket.on('disconnect', () => {
            console.log('user disconnected', socket.id);
        })
    })
}



const notification = require("../models/notificationModel")

const notifications = {

    createNotification: async (payload)=>{
    
        try {
            const newNoti = await notification.create(payload);
            return newNoti;
        } catch (error) {
            return error
        }
    },

    getNotifications: async (req, res)=>{
        const {userId} = req.params;
        // console.log(userId)
        try {
           const notifications = await notification.find({for_user: {$in: [userId]}});
        //    console.log(notifications)
           res.send(notifications)
        } catch (error) {
            res.send(error)
        }
    }




} 


module.exports = notifications;

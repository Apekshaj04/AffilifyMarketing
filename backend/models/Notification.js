const mongoose = require("mongoose");

const NotificationSchema = new mongoose.Schema(
    {
        affiliateAddress: {
            type: String,
            required: true,
            match: /^0x[a-fA-F0-9]{40}$/,
        },
        company: {
            type: String,
            required: true
        },
        message: {
            type: String,
            required: true,
            trim: true, 
        },
        cid: {
            type: String,
            required: true,
        }
    },
    { timestamps: true }
);

const Notification = mongoose.model("Notification", NotificationSchema);
module.exports = Notification;

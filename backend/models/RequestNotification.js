const mongoose = require("mongoose");

const NotificationSchema = new mongoose.Schema(
    {
        affiliateAddress: {
            type: String,
            required: true,
            match: /^0x[a-fA-F0-9]{40}$/,
        },
        companyAddress : {
            type:String , 
            required: true ,
            match : /^0x[a-fA-F0-9]{40}$/,
        },
        message:{
            type:String,
            default : "You have got a product request from a company"
        },
        product:{
            type:mongoose.Schema.Types.ObjectId ,
            ref : "Product",
            required:true
        }
    },
    { timestamps: true }
);

const Notification = mongoose.model("RequestNotification", NotificationSchema);
module.exports = Notification;

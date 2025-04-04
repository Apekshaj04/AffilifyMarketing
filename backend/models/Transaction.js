const mongoose = require("mongoose");

const TransactionSchema = new mongoose.Schema(
    {
        companyAddress:{
            type:String , 
            required: true ,
            match : /^0x[a-fA-F0-9]{40}$/,
        },
        affiliateAddress:{
            type:String , 
            required: true ,
            match : /^0x[a-fA-F0-9]{40}$/,
        },
        productName:{
            type:String,
            required:true 
        },
        price:{
            type:Number,
            default:0.05
        },
        cid:{
            type:String,
            required:true 
        }
    }
);

const Transaction = mongoose.model("Transaction", TransactionSchema);
module.exports = Transaction;

const mongoose = require('mongoose')

const CompanySchema = new mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true
    },
    walletAddress:{
        type: String, 
        required: true,
        match: /^0x[a-fA-F0-9]{40}$/
    },
    products:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Product'
    }],
    category:{
        type:[String],
        default : []
    }

})

const Company = mongoose.model('Company',CompanySchema);
module.exports = Company;
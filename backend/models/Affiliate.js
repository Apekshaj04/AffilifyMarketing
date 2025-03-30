const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid");

const affiliateSchema = new mongoose.Schema({
    fullName:{
        type:String ,
        default:"Undefined"
    },
    Email:{
        type:String,
        default:"Undefined"
    },
    Phone:{
        type:String,
        default:"0000000000",
        validate: {
            validator: function(v) {
                return /^\d{10}$/.test(v); // Ensures exactly 10 digits
            },
            message: props => `${props.value} is not a valid phone number! It must be exactly 10 digits.`
        }
    },
    Address:{
        type:String,
        default:"Undefined"
    },

    walletAddress: {
        type: String,
        required: true,
        unique: true,
        match: /^0x[a-fA-F0-9]{40}$/ // Validates Ethereum addresses
    },
    tokens: { type: Number, default: 0 },
    code: { type: String, unique: true, required: true },
    recentlyAffiliated: [
        {
            product: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
            affiliatedAt: { type: Date, default: Date.now }
        }
    ],
    links: [
        {
            product: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
            affiliateLink: { type: String }
        }
    ]
});

// ✅ Generate a unique code for each affiliate before saving
affiliateSchema.pre("validate", async function (next) {
    if (!this.code) {
        let uniqueCode;
        let isUnique = false;
        while (!isUnique) {
            uniqueCode = uuidv4().split("-")[0];
            const existingAffiliate = await mongoose.model("Affiliate").findOne({ code: uniqueCode });
            if (!existingAffiliate) isUnique = true;
        }
        this.code = uniqueCode;
    }
    next();
});

const Affiliate = mongoose.model("Affiliate", affiliateSchema);
module.exports = Affiliate;

const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid");

const affiliateSchema = new mongoose.Schema({
    fullName: {
        type: String,
        default: "Undefined"
    },
    Email: {
        type: String,
        default: "Undefined"
    },
    Phone: {
        type: String,
        default: "0000000000",
        validate: {
            validator: function(v) {
                return /^\d{10}$/.test(v);
            },
            message: props => `${props.value} is not a valid phone number!`
        }
    },
    Address: {
        type: String,
        default: "Undefined"
    },
    walletAddress: {
        type: String,
        required: true,
        unique: true,
        match: /^0x[a-fA-F0-9]{40}$/
    },
    tokens: { 
        type: Number, 
        default: 0 
    },
    code: { 
        type: String, 
        unique: true, 
        required: true 
    },
    topCategory: {  // New field to store the top category
        type: String,
        default: null
    },
    recentlyAffiliated: [
        {
            product: { 
                type: mongoose.Schema.Types.ObjectId, 
                ref: "Product" 
            },
            affiliatedAt: { 
                type: Date, 
                default: Date.now 
            }
        }
    ],
    links: [
        {
            product: { 
                type: mongoose.Schema.Types.ObjectId, 
                ref: "Product" 
            },
            affiliateLink: { 
                type: String 
            }
        }
    ]
});

// Generate unique code
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

// Update topCategory when recentlyAffiliated changes
affiliateSchema.pre("save", async function(next) {
    if (this.isModified("recentlyAffiliated") && this.recentlyAffiliated.length > 0) {
        try {
            // Populate the products to access their categories
            const affiliate = await this.populate({
                path: "recentlyAffiliated.product",
                select: "category"
            });
            
            // Count category occurrences
            const categoryCount = {};
            affiliate.recentlyAffiliated.forEach(item => {
                if (item.product && item.product.category) {
                    categoryCount[item.product.category] = 
                        (categoryCount[item.product.category] || 0) + 1;
                }
            });
            
            // Find the most frequent category
            let topCategory = null;
            let maxCount = 0;
            for (const [category, count] of Object.entries(categoryCount)) {
                if (count > maxCount) {
                    maxCount = count;
                    topCategory = category;
                }
            }
            
            this.topCategory = topCategory;
        } catch (err) {
            console.error("Error calculating top category:", err);
        }
    }
    next();
});

const Affiliate = mongoose.model("Affiliate", affiliateSchema);
module.exports = Affiliate;
const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const Affiliate = require('../models/Affiliate');
const Product = require('../models/Product');
const Company = require('../models/Company')

// ======================
// TEST ROUTE (should be first)
// ======================
router.get('/test', (req, res) => {
    res.json({ 
        message: "Affiliate API is working",
        status: "active",
        timestamp: new Date().toISOString()
    });
});

router.get("/topMost/:walletAddress", async (req, res) => {
    try {
        const { walletAddress } = req.params;
        
        const affiliate = await Affiliate.findOne({ walletAddress })
            .populate({
                path: "recentlyAffiliated.product",
                select: "category"
            });
        
        if (!affiliate) {
            return res.status(404).json({ 
                success: false,
                message: "Affiliate not found in database" 
            });
        }

        if (!affiliate.recentlyAffiliated || affiliate.recentlyAffiliated.length === 0) {
            return res.status(200).json({
                success: true,
                message: "Affiliate hasn't affiliated any products yet",
                topCategory: null,
                categories: []  // Return empty array for no categories
            });
        }

        const categoryCount = {};
        affiliate.recentlyAffiliated.forEach(item => {
            if (item.product?.category) {
                categoryCount[item.product.category] = 
                    (categoryCount[item.product.category] || 0) + 1;
            }
        });

        let topCategory = null;
        let maxCount = 0;
        for (const [category, count] of Object.entries(categoryCount)) {
            if (count > maxCount) {
                maxCount = count;
                topCategory = category;
            }
        }

        // Get just the category names (keys) as an array
        const categories = Object.keys(categoryCount);

        return res.status(200).json({
            success: true,
            topCategory: topCategory,
            categories: categories,  // Now returns array of category names
            message: `Top category identified: ${topCategory}`
        });

    } catch (err) {
        console.error("Top Category Error:", err);
        return res.status(500).json({
            success: false,
            message: "Failed to determine top category",
            error: err.message
        });
    }
});

// ======================
// AFFILIATE REGISTRATION/LOGIN
// ======================
router.post('/register', async (req, res) => {
    try {
        const { walletAddress } = req.body;
        const existingAffiliate = await Affiliate.findOne({ walletAddress });

        if (existingAffiliate) {
            return res.status(400).json({ message: 'Wallet already registered as affiliate' });
        }

        const newAffiliate = new Affiliate({ walletAddress }); 
        await newAffiliate.save();

        res.json({ 
            message: 'Affiliate registration successful', 
            affiliate: newAffiliate 
        });
    } catch (error) {
        console.error('Registration Error:', error);
        res.status(500).json({ message: 'Registration failed - server error' });
    }
});

router.post('/login', async (req, res) => {
    try {
        const { walletAddress } = req.body;
        const affiliate = await Affiliate.findOne({ walletAddress });

        if (!affiliate) {
            return res.status(404).json({ message: 'No affiliate found with this wallet' });
        }

        res.json({ 
            message: 'Login successful', 
            affiliate 
        });
    } catch (err) {
        console.error('Login Error:', err);
        res.status(500).json({ message: 'Login failed - server error' });
    }
});

// ======================
// AFFILIATE PRODUCT MANAGEMENT
// ======================


// ======================
// LINK TRACKING
// ======================
router.get("/getWalletByLink", async (req, res) => {
    try {
        const { affiliateLink } = req.query;
        if (!affiliateLink) return res.status(400).json({ message: "Affiliate link required" });

        const affiliate = await Affiliate.findOne({ "links.affiliateLink": affiliateLink });
        if (!affiliate) return res.status(404).json({ message: "No affiliate found for this link" });

        res.json({ walletAddress: affiliate.walletAddress });
    } catch (error) {
        console.error("Link Lookup Error:", error);
        res.status(500).json({ message: "Failed to find affiliate by link" });
    }
});

router.get("/getRecentlyAffiliated", async (req, res) => {
    try {
        const { walletAddress } = req.query;
        if (!walletAddress) return res.status(400).json({ message: "Wallet address required" });

        const affiliate = await Affiliate.findOne({ walletAddress })
            .populate("recentlyAffiliated.product", "name category price image")
            .populate("links.product", "_id");

        if (!affiliate) return res.status(404).json({ message: "Affiliate account not found" });

        const recentlyAffiliatedWithLinks = affiliate.recentlyAffiliated.map((item) => {
            const productId = item.product?._id.toString();
            const linkEntry = affiliate.links.find(link => 
                link.product && link.product._id.toString() === productId
            );

            return {
                _id: productId,
                name: item.product.name,
                category: item.product.category,
                price: item.product.price,
                image: item.product.image,
                affiliatedAt: item.affiliatedAt,
                affiliateLink: linkEntry?.affiliateLink || null
            };
        });

        res.json({ recentlyAffiliated: recentlyAffiliatedWithLinks });
    } catch (error) {
        console.error("Affiliated Products Error:", error);
        res.status(500).json({ message: "Failed to get affiliated products" });
    }
});
router.post('/incrementCount', async (req, res) => {
    try {
        const { affiliateAddress, productId } = req.body;

        const product = await Product.findById(productId);
        if (!product) return res.status(404).json({ message: "Product not found" });

        const affiliate = await Affiliate.findOne({ walletAddress: affiliateAddress });
        if (!affiliate) return res.status(404).json({ message: "Affiliate not found" });

        if(!affiliate.recentlyAffiliated.some(item => item.product.toString() === productId)) {
            return res.status(400).json({ message: "Affiliate hasn't registered this product" });
        }

        product.count.set(affiliateAddress, (product.count.get(affiliateAddress) || 0 + 1));
        await product.save();

        affiliate.tokens += 2;
        await affiliate.save();

        res.json({ message: "Count incremented", product });
    } catch (err) {
        console.error("Count Error:", err);
        res.status(500).json({ message: "Failed to increment count" });
    }
});

router.get("/getAffiliatesAscending", async (req, res) => {
    try {
        const affiliates = await Affiliate.find()
            .select('walletAddress recentlyAffiliated tokens')
            .lean();

        if (!affiliates?.length) return res.status(404).json({ message: "No affiliates found" });
        
        const sortedAffiliates = affiliates.map(affiliate => ({
            walletAddress: affiliate.walletAddress,
            score: (affiliate.recentlyAffiliated?.length || 20) * 10 + (affiliate.tokens || 0) * 2,
            affScore: affiliate.recentlyAffiliated?.length || 0,
            clicks: affiliate.tokens || 0
        })).sort((a, b) => a.score - b.score);

        res.json({
            affiliates: sortedAffiliates
        });
    } catch (error) {
        console.error("Sorting Error:", error);
        res.status(500).json({ message: "Failed to sort affiliates" });
    }
});

router.get("/getAffiliatesDescending", async (req, res) => {
    try {
        const affiliates = await Affiliate.find()
            .select('walletAddress recentlyAffiliated tokens')
            .lean();

        if (!affiliates?.length) return res.status(404).json({ message: "No affiliates found" });
        
        const sortedAffiliates = affiliates.map(affiliate => ({
            walletAddress: affiliate.walletAddress,
            score: (affiliate.recentlyAffiliated?.length || 0) * 10 + (affiliate.tokens || 0) * 2,
            affScore: affiliate.recentlyAffiliated?.length || 0,
            clicks: affiliate.tokens || 0
        })).sort((a, b) => b.score - a.score);

        res.json({
            affiliates: sortedAffiliates
        });
    } catch (error) {
        console.error("Sorting Error:", error);
        res.status(500).json({ message: "Failed to sort affiliates" });
    }
});

router.get("/product-by-link", async (req, res) => {
    try {
        const { link } = req.query;
        if (!link) return res.status(400).json({ error: "Affiliate link is required" });

        const affiliate = await Affiliate.findOne({ "links.affiliateLink": link }).populate("links.product");
        if (!affiliate) return res.status(404).json({ error: "Affiliate link not found" });

        const linkedProduct = affiliate.links.find(item => item.affiliateLink === link);
        if (!linkedProduct || !linkedProduct.product) return res.status(404).json({ error: "Product not found" });

        res.json({ product: linkedProduct.product });
    } catch (error) {
        console.error("Error fetching product by affiliate link:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});


// AFFILIATE PROFILE MANAGEMENT
// ======================
router.get("/:walletAddress", async (req, res) => {
    try {
        const { walletAddress } = req.params;
        const affiliate = await Affiliate.findOne({ walletAddress });

        if (!affiliate) return res.status(404).json({ message: "Affiliate profile not found" });

        res.json(affiliate);
    } catch (error) {
        console.error("Profile Fetch Error:", error);
        res.status(500).json({ message: "Failed to get affiliate profile" });
    }
});

router.put("/:walletAddress", async (req, res) => {
    try {
        const { walletAddress } = req.params;
        const updatedAffiliate = await Affiliate.findOneAndUpdate(
            { walletAddress },
            { $set: req.body },
            { new: true, runValidators: true }
        );

        if (!updatedAffiliate) return res.status(404).json({ message: "Affiliate not found for update" });

        res.json({ 
            message: "Profile updated", 
            affiliate: updatedAffiliate 
        });
    } catch (error) {
        console.error("Update Error:", error);
        res.status(500).json({ message: "Failed to update profile" });
    }
});


router.get('/getClickCounts/:productId/:affiliateAddress', async (req, res) => {
    try {
        const { productId, affiliateAddress } = req.params;

        const product = await Product.findById(productId);
        if (!product) return res.status(404).json({ message: "Product not found" });

        const affiliate = await Affiliate.findOne({ walletAddress: affiliateAddress });
        if (!affiliate) return res.status(404).json({ message: "Affiliate not found" });

        if(!affiliate.recentlyAffiliated.some(item => item.product.equals(product._id))) {
            return res.status(400).json({ message: "Product not affiliated by this account" });
        }

        res.json({ 
            clickCount: product.count.get(affiliateAddress) || 0 
        });
    } catch (err) {
        console.error("Count Fetch Error:", err);
        res.status(500).json({ message: "Failed to get click counts" });
    }
});
router.post("/affiliateProduct/:productId", async (req, res) => {
    try {
        const { productId } = req.params;
        const { walletAddress } = req.body;

        if (!walletAddress) return res.status(400).json({ message: "Wallet address required" });

        const affiliate = await Affiliate.findOne({ walletAddress });
        if (!affiliate) return res.status(404).json({ message: "Affiliate account not found" });

        const product = await Product.findById(productId);
        if (!product) return res.status(404).json({ message: "Product not found" });

        // Check if the product is already affiliated
        const alreadyAffiliated = affiliate.recentlyAffiliated.some((aff) => aff.product.toString() === productId);
        if (alreadyAffiliated) {
            return res.status(400).json({ message: 'Product already affiliated' });
        }

        const affiliateLink = `${product.link}?ref=${affiliate.code}`;
        affiliate.recentlyAffiliated.push({ product: product._id, affiliatedAt: Date.now() });
        affiliate.links.push({ product: product._id, affiliateLink });
        await affiliate.save();

        res.json({ 
            message: "Affiliate link created!", 
            affiliateLink 
        });
    } catch (error) {
        console.error("Product Affiliation Error:", error);
        res.status(500).json({ message: "Failed to create affiliate link" });
    }
});

router.get('/match/:companyAddress/:affiliateAddress', async (req, res) => {
    try {
        const { companyAddress, affiliateAddress } = req.params;

        // 1. Fetch company categories
        const company = await Company.findOne({ walletAddress: companyAddress });
        if (!company) {
            return res.status(404).json({ 
                success: false,
                message: "Company not found" 
            });
        }

        // 2. Fetch affiliate's top categories
        const affiliate = await Affiliate.findOne({ walletAddress: affiliateAddress })
            .populate({
                path: 'recentlyAffiliated.product',
                select: 'category'
            });

        if (!affiliate) {
            return res.status(404).json({ 
                success: false,
                message: "Affiliate not found" 
            });
        }

        // 3. Extract all unique categories from affiliate's products
        const affiliateCategories = new Set();
        affiliate.recentlyAffiliated.forEach(item => {
            if (item.product?.category) {
                affiliateCategories.add(item.product.category.toString().trim().toLowerCase());
            }
        });

        // 4. Normalize company categories
        const companyCategories = new Set(
            (company.category || []).map(cat => cat.toString().trim().toLowerCase())
        );

        // 5. Calculate matching score (Jaccard similarity)
        const intersection = new Set(
            [...affiliateCategories].filter(cat => companyCategories.has(cat))
        );
        const union = new Set([...affiliateCategories, ...companyCategories]);

        // Use .size property (not .size() method)
        const score = union.size > 0 ? intersection.size / union.size : 0;

        res.json({
            success: true,
            score:Math.round(score*100),
            matchingCategories: [...intersection],
            companyCategories: [...companyCategories],
            affiliateCategories: [...affiliateCategories],
            debug: {
                companySize: companyCategories.size,
                affiliateSize: affiliateCategories.size,
                intersectionSize: intersection.size,
                unionSize: union.size
            }
        });

    } catch (error) {
        console.error('Match Error:', error);
        res.status(500).json({ 
            success: false,
            message: "Failed to calculate matching score",
            error: error.message,
            stack: error.stack // Include stack trace for debugging
        });
    }
});



module.exports = router;
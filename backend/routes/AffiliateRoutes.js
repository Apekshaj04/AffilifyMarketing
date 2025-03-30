const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const Affiliate = require('../models/Affiliate');
const Product = require('../models/Product');


router.post('/register', async (req, res) => {
    try {
        const { walletAddress } = req.body;
        const existingAffiliate = await Affiliate.findOne({ walletAddress });

        if (existingAffiliate) {
            return res.status(400).json({ message: 'Affiliate already exists' });
        }

        const newAffiliate = new Affiliate({ walletAddress }); 
        await newAffiliate.save();

        res.json({ message: 'Affiliate created successfully', affiliate: newAffiliate });
    } catch (error) {
        console.error('Error in /register:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});


router.post('/login', async (req, res) => {
    try {
        const { walletAddress } = req.body;
        const affiliate = await Affiliate.findOne({ walletAddress });

        if (!affiliate) {
            return res.status(404).json({ message: 'You are not registered as an affiliate' });
        }

        res.json({ message: 'Login successful', affiliate });
    } catch (err) {
        console.error('Error in /login:', err);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});
router.post("/affiliateProduct/:productId", async (req, res) => {
    try {
        const { productId } = req.params;
        const { walletAddress } = req.body;

        if (!walletAddress) return res.status(400).json({ message: "Wallet address is required" });

        const affiliate = await Affiliate.findOne({ walletAddress });
        if (!affiliate) return res.status(404).json({ message: "Affiliate not found" });

        const product = await Product.findById(productId);
        if (!product) return res.status(404).json({ message: "Product not found" });

        if(affiliate.recentlyAffiliated.includes(product)){
            return res.status(500).json({message:'Product already exists in recently affiliated products'});
        }
        const affiliateLink = `${product.link}?ref=${affiliate.code}`;
        affiliate.recentlyAffiliated.push({product:product._id,affiliatedAt:Date.now()})
        affiliate.links.push({ product: product._id, affiliateLink });
        await affiliate.save();

        res.json({ message: "Affiliate link generated!", affiliateLink });
    } catch (error) {
        console.error("Error in /affiliateProduct:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
});

// ✅ Get an affiliate's wallet address using their link
router.get("/getWalletByLink", async (req, res) => {
    try {
        const { affiliateLink } = req.query;
        if (!affiliateLink) return res.status(400).json({ message: "Affiliate link is required" });

        const affiliate = await Affiliate.findOne({ "links.affiliateLink": affiliateLink });

        if (!affiliate) return res.status(404).json({ message: "Affiliate link not found" });

        res.json({ walletAddress: affiliate.walletAddress });
    } catch (error) {
        console.error("Error in /getWalletByLink:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
});
router.post("/trackClick", async (req, res) => {
    try {
        const { affiliateLink, walletAddress, senderWalletAddress } = req.body;

        if (!walletAddress || !affiliateLink || !senderWalletAddress) {
            return res.status(400).json({ message: "Wallet address, sender wallet address, and affiliate link are required" });
        }

        const normalizedWallet = walletAddress.trim().toLowerCase();
        const normalizedSenderWallet = senderWalletAddress.trim().toLowerCase();

        if (normalizedWallet === normalizedSenderWallet) {
            return res.status(400).json({ message: "Sender wallet address cannot be the same as the affiliate's wallet address" });
        }

        const affiliate = await Affiliate.findOne({ walletAddress: normalizedWallet });
        if (!affiliate) return res.status(404).json({ message: "Affiliate not found" });

        let link = affiliate.links.find(l => l.affiliateLink === affiliateLink);
        if (!link) return res.status(404).json({ message: "Affiliate link not found" });

        const product = await Product.findById(link.product);
        if (!product) return res.status(404).json({ message: "Product not found" });

        // ✅ Prevent duplicate product additions in recentlyAffiliated
        const isAlreadyAffiliated = affiliate.recentlyAffiliated.some(
            (entry) => entry.product.toString() === product._id.toString()
        );

        if (!isAlreadyAffiliated) {
            affiliate.recentlyAffiliated.push({ product: product._id });
            await affiliate.save();
        }

        // Increment affiliate link clicks
        link.clicks = (link.clicks || 0) + 1;
        await affiliate.save();

        // Track sender's click count in the product model
        const productCount = product.count.get(normalizedSenderWallet) || 0;
        product.count.set(normalizedSenderWallet, productCount + 1);
        await product.save();

        res.json({
            message: "Click tracked successfully.",
            product: product.name,
            productId: product._id,
            company: product.Company,
            totalClicks: link.clicks,
            senderWalletAddress: normalizedSenderWallet,
            affiliateClicks: product.count.get(normalizedSenderWallet),
            successMessage: `Click registered from ${normalizedSenderWallet} for product ${product.name}.`
        });

    } catch (error) {
        console.error("Error in /trackClick:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
});

router.get("/getRecentlyAffiliated", async (req, res) => {
    try {
        const { walletAddress } = req.query;
        if (!walletAddress) {
            return res.status(400).json({ message: "Wallet address is required" });
        }

        // Fetch the affiliate details, including recently affiliated products and links
        const affiliate = await Affiliate.findOne({ walletAddress })
            .populate({
                path: "recentlyAffiliated.product",
                select: "name category price image", // Selecting only necessary fields
            })
            .populate({
                path: "links.product",
                select: "_id", // Fetching only the product ID for comparison
            });

        if (!affiliate) {
            return res.status(404).json({ message: "Affiliate not found" });
        }

        const recentlyAffiliatedWithLinks = affiliate.recentlyAffiliated.map((item) => {
            const productId = item.product?._id.toString();

            const linkEntry = affiliate.links.find(link => 
                link.product && link.product._id.toString() === productId
            );
            console.log(linkEntry.affiliateLink)

            return {
                _id: productId,
                name: item.product.name,
                category: item.product.category,
                price: item.product.price,
                image: item.product.image,
                affiliatedAt: item.affiliatedAt,
                affiliateLink: linkEntry ? linkEntry.affiliateLink : null
            };
        });

        return res.json({ recentlyAffiliated: recentlyAffiliatedWithLinks });

    } catch (error) {
        console.error("❌ API Error:", error);
        res.status(500).json({ message: "Server error fetching affiliated products" });
    }
});

router.get("/:walletAddress", async (req, res) => {
    try {
        const { walletAddress } = req.params;
        const affiliate = await Affiliate.findOne({ walletAddress });

        if (!affiliate) {
            return res.status(404).json({ message: "Affiliate not found" });
        }

        res.json(affiliate);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


// ✅ Update Affiliate Details
router.put("/:walletAddress", async (req, res) => {
    try {
        const { walletAddress } = req.params;
        const updateData = req.body; // Data to update

        const updatedAffiliate = await Affiliate.findOneAndUpdate(
            { walletAddress },
            { $set: updateData }, // Update fields dynamically
            { new: true, runValidators: true } // Return updated document & run validators
        );

        if (!updatedAffiliate) {
            return res.status(404).json({ message: "Affiliate not found" });
        }

        res.json({ message: "Affiliate updated successfully", affiliate: updatedAffiliate });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;

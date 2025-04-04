const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const Company = require('../models/Company');
const Product = require('../models/Product');

router.post('/register', async (req, res) => {
    try {
        const { name, email, walletAddress } = req.body;
        const existing = await Company.findOne({ walletAddress });

        if (existing) {
            return res.status(400).json({ message: 'Company already registered' });
        }

        const company = new Company({ name, email, walletAddress });
        await company.save();
        res.json({ message: 'Registered successfully', company });
    } catch (err) {
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

router.post('/login', async (req, res) => {
    try {
        const { walletAddress } = req.body;
        const company = await Company.findOne({ walletAddress });

        if (!company) {
            return res.status(404).json({ message: 'Invalid wallet address' });
        }

        res.json({ message: 'Logged in successfully', company });
    } catch (err) {
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

router.get('/viewProduct/:productId', async (req, res) => {
    try {
        const { productId } = req.params;
        const product = await Product.findById(productId)
            .populate('Affiliate', 'walletAddress tokens')
            .lean();

        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        const countMap = new Map(Object.entries(product.count || {}));
        const affiliatesWithCount = product.Affiliate.map(affiliate => ({
            _id: affiliate._id,
            walletAddress: affiliate.walletAddress,
            tokens: affiliate.tokens,
            customers_brought: countMap.get(affiliate._id.toString()) || 0
        }));

        res.json({
            productId: product._id,
            name: product.name,
            category: product.category,
            affiliates: affiliatesWithCount
        });
    } catch (err) {
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

router.get('/getCompanyByWallet/:walletAddress', async (req, res) => {
    try {
        let { walletAddress } = req.params;
        walletAddress = walletAddress.toLowerCase();
        const company = await Company.findOne({ walletAddress });

        if (!company) {
            return res.status(404).json({ message: 'Company does not exist' });
        }

        return res.json(company);
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
});
router.get("/getProductsByCompany/:walletAddress", async (req, res) => {
    try {
        const { walletAddress } = req.params;
        console.log("🔹 Received Wallet Address:", walletAddress);

        const company = await Company.findOne({
            walletAddress: { $regex: `^${walletAddress}$`, $options: "i" }
        }).populate("products").exec();

        if (!company) {
            console.log("❌ Company not found for wallet:", walletAddress);
            return res.status(404).json({ message: "Company does not exist" });
        }

        console.log("✅ Found Company:", company._id);
        console.log("🔹 Total Products:", company.products.length);

        return res.json({
            products: company.products,
            totalProducts: company.products.length,
        });

    } catch (error) {
        console.error("❌ Error in getProductsByCompany:", error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
});
// 🔹 Add a Product to a Company
router.post("/addProduct/:walletAddress", async (req, res) => {
    try {
        const { walletAddress } = req.params;
        const { name, price, category, sub_category, image, link } = req.body;

        // Find company using walletAddress (case-insensitive)
        const company = await Company.findOne({
            walletAddress: { $regex: `^${walletAddress}$`, $options: "i" }
        }).exec();

        if (!company) {
            console.log("❌ Company not found for wallet:", walletAddress);
            return res.status(404).json({ message: "Company not found" });
        }

        // Check if the product already exists for this company
        const existingProduct = await Product.findOne({
            name: { $regex: `^${name}$`, $options: "i" }, // Case-insensitive name check
            Company: company._id
        });

        if (existingProduct) {
            console.log("⚠️ Product already exists:", existingProduct.name);
            return res.status(400).json({ message: "Product already exists for this company" });
        }

        // Create and save the new product
        const product = new Product({
            name,
            price,
            category,
            sub_category,
            image,
            link,
            Company: company._id
        });

        await product.save();
        console.log("✅ Product saved:", product);

        // Add product to company's product array and update in DB
        company.products.push(product._id);
        await company.save();

        console.log("✅ Updated Company Products:", company.products);
        return res.status(201).json({ message: "Product added successfully", product });

    } catch (error) {
        console.error("❌ Error in addProduct:", error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
});


router.get('/:walletAddress', async (req, res) => {
    try {
        const company = await Company.findOne({ walletAddress: req.params.walletAddress }).populate('products');
        if (!company) {
            return res.status(404).json({ message: 'Company not found' });
        }
        res.json(company);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});
router.get("/wallet/:companyId", async (req, res) => {
    try {
        const { companyId } = req.params;

        // Find company by ID
        const company = await Company.findById(companyId);
        if (!company) {
            return res.status(404).json({ error: "Company not found" });
        }

       return  res.json({ walletAddress: company.walletAddress });

    } catch (error) {
        console.error("Error fetching walletAddress:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});
router.put('/:walletAddress', async (req, res) => {
    try {
        const { walletAddress } = req.params;
        const updateData = req.body;

        // Find the company first
        const company = await Company.findOne({ walletAddress });
        if (!company) {
            return res.status(404).json({ 
                success: false,
                message: "Company not found" 
            });
        }

        // Handle category updates separately
        if (updateData.category && Array.isArray(updateData.category)) {
            // Combine existing and new categories, remove duplicates
            const combinedCategories = [...new Set([
                ...company.category,
                ...updateData.category
            ])];
            
            updateData.category = combinedCategories;
        }

        // Update all other fields
        const updatedCompany = await Company.findOneAndUpdate(
            { walletAddress },
            { $set: updateData },
            { new: true, runValidators: true }
        );

        res.json({
            success: true,
            message: "Company updated successfully",
            company: updatedCompany
        });

    } catch (error) {
        console.error('Update Error:', error);
        res.status(500).json({
            success: false,
            message: "Failed to update company",
            error: error.message
        });
    }
});

module.exports = router;

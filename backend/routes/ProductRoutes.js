const express = require("express");
const Product = require("../models/Product");
const Company = require("../models/Company");
const Affiliate = require("../models/Affiliate")
const router = express.Router();

const BASE_URL = "https://xyz.com/product"; 

router.post("/addProduct", async (req, res) => {
    try {
        console.log("🔹 Received Request Body:", req.body); 
        const { name, price, category, sub_category, image, link, company } = req.body;

        if (!name || !price || !category || !sub_category || !image || !link || !company) {
            console.log("❌ Missing Fields:", { name, price, category, sub_category, image, link, company });
            return res.status(400).json({ message: "All fields are required.", received: req.body });
        }

        const existingCompany = await Company.findById(company);
        if (!existingCompany) {
            return res.status(404).json({ message: "Invalid Company ID. Company not found." });
        }

        const product = new Product({
            name,
            price,
            category,
            sub_category,
            image,
            link,
            Company: existingCompany._id // ✅ Ensure ObjectId is correctly assigned
        });

        await product.save();
        res.json({ message: "Product added successfully", product });

    } catch (error) {
        console.error("❌ Error in /addProduct:", error);
        res.status(500).json({ message: "Server error, please try again later." });
    }
});

router.get("/", async (req, res) => {
    try {
        const products = await Product.find()
            .populate("affiliates.affiliate")
            .populate("company");
        if (!products.length) {
            return res.status(404).json({ message: "No products available." });
        }
        res.json(products);
    } catch (error) {
        console.error("Error fetching products:", error);
        res.status(500).json({ message: "Server error, please try again later." });
    }
});

router.get("/recommendAllProducts", async (req, res) => {
    try {
        const products = await Product.aggregate([
            { $sample: { size: 32 } }, // Fetch 32 random products
            { 
                $project: { 
                    _id: 1, name: 1, category: 1, sub_category: 1, price: 1, image: 1, link: 1 
                } 
            }
        ]);

        res.json(products);
    } catch (error) {
        console.error("Error fetching recommended products:", error);
        res.status(500).json({ message: "Server error, please try again later." });
    }
});

router.get("/:id", async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).json({ message: "Product not found." });
        }
        res.json(product);
    } catch (error) {
        console.error("Error fetching product:", error);
        res.status(500).json({ message: "Server error, please try again later." });
    }
});


module.exports = router;

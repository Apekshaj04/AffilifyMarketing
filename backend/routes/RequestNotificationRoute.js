const express = require("express")
const router = express.Router();
const RequestNotification = require("../models/RequestNotification");
const Company = require("../models/Company");
const Product = require("../models/Product.js")


router.post("/createRequest/:companyWallet", async (req, res) => {
    try {
        const { companyWallet } = req.params;
        const { affiliateWallet, product } = req.body;

        // Validate input
        if (!affiliateWallet || !product) {
            return res.status(400).json({ 
                success: false,
                message: "Affiliate wallet and product ID are required" 
            });
        }

        // Fetch company and product in parallel
        const [company, productFound] = await Promise.all([
            Company.findOne({ walletAddress: companyWallet }),
            Product.findById(product)
        ]);

        if (!company) {
            return res.status(404).json({ 
                success: false,
                message: "Company not found" 
            });
        }

        if (!productFound) {
            return res.status(404).json({ 
                success: false,
                message: "Product not found" 
            });
        }

        // Create and save notification
        const requestNotification = new RequestNotification({
            companyAddress: companyWallet,
            affiliateAddress: affiliateWallet,
            product: productFound._id,
            message: `You have a request for ${productFound.name} from ${company.name}`,
            productDetails: {
                name: productFound.name,
                image: productFound.image,
                price: productFound.price
            }
        });

        await requestNotification.save();

        res.json({ 
            success: true,
            message: "Request created successfully",
            notification: requestNotification
        });

    } catch (error) {
        console.error("Request Creation Error:", error);
        res.status(500).json({ 
            success: false,
            message: "Failed to create request",
            error: error.message 
        });
    }
});


router.get("/getRequest/:affiliateWallet",async(req,res)=>{
    try{
        const {affiliateWallet} = req.params
        const requestNotifications = await RequestNotification.find({affiliateAddress:affiliateWallet})
        return res.status(200).json(requestNotifications);
    }
    catch(err){
        console.log(err);
    }
})
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const deletedRequest = await RequestNotification.findByIdAndDelete(id);
        
        if (!deletedRequest) {
            return res.status(404).json({ 
                success: false,
                message: "Request not found" 
            });
        }

        res.json({
            success: true,
            message: "Request deleted successfully"
        });
    } catch (error) {
        console.error('Delete Error:', error);
        res.status(500).json({
            success: false,
            message: "Failed to delete request",
            error: error.message
        });
    }
});
module.exports = router ; 
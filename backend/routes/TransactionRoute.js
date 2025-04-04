const express = require("express");
const router = express.Router();
const Transaction = require("../models/Transaction")
const cors = require('cors')
router.use(cors())

router.post("/createTransaction", async (req, res) => {
    try {
      console.log("Received Transaction Data:", req.body);
      const { affiliateAddress, companyAddress, productName, price, cid } = req.body;
  
      if (![affiliateAddress, companyAddress, productName, cid].every(Boolean)) {
        return res.status(400).json({ message: "All fields are required" });
      }
  
      const transact = new Transaction({
        affiliateAddress,
        companyAddress,
        productName,
        price: price || 0.05,
        cid
      });
  
      await transact.save();
  
      res.status(201).json({ message: "Transaction created successfully", transaction: transact });
  
    } catch (error) {
      console.error("❌ Error in createTransaction:", error.message);
      res.status(500).json({ message: "Internal Server Error" });
    }
  });
  
router.get("/company/:companyAddress",async (req,res)=>{
    try{
        const companyAddress = req.params.companyAddress
        const transactions = await Transaction.find({companyAddress:companyAddress})
        res.json(transactions)
        }catch(err){
            res.status(500).json({message:err.message})
            }
})

router.get("/affiliate/:affiliateAddress",async(req,res)=>{
    try{
        const affiliateAddress = req.params.affiliateAddress
        const transactions = await Transaction.find({affiliateAddress:affiliateAddress})
        res.json(transactions)
        }catch(err){
            res.status(500).json({message:err.message})
        }
})

module.exports = router ;
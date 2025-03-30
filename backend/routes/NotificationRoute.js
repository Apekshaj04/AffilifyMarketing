const express = require("express");
const router = express.Router();
const Notification = require("../models/Notification");

router.post("/addNotification", async (req, res) => {
    try {
        const { affiliateAddress, company, message, cid } = req.body;

        if (!affiliateAddress || !company || !message || !cid) {
            return res.status(400).json({ error: "All fields are required." });
        }

        const notification = new Notification({ affiliateAddress, company, message, cid });
        await notification.save();

        res.status(201).json({ success: true, message: "Notification added successfully." });
    } catch (err) {
        console.error("Error adding notification:", err);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

router.get("/affiliate/:affiliateAddress", async (req, res) => {
    try {
        const { affiliateAddress } = req.params;
        if (!/^0x[a-fA-F0-9]{40}$/.test(affiliateAddress)) {
            return res.status(400).json({ error: "Invalid Ethereum address format." });
        }

        const notifications = await Notification.find({ affiliateAddress }).sort({ createdAt: -1 });

        res.json(notifications);
    } catch (err) {
        console.error("Error fetching affiliate notifications:", err);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

router.get("/company/:company", async (req, res) => {
    try {
        const { company } = req.params;      
        const notifications = await Notification.find({ company }).sort({ createdAt: -1 });

        res.json(notifications);
    } catch (err) {
        console.error("Error fetching company notifications:", err);
        res.status(500).json({ error: "Internal Server Error" });
    }
});



// ✅ Mark a notification as read
router.put("/markAsRead/:notificationId", async (req, res) => {
    try {
        const { notificationId } = req.params;

        const updatedNotification = await Notification.findByIdAndUpdate(
            notificationId,
            { read: true },
            { new: true }
        );

        if (!updatedNotification) {
            return res.status(404).json({ error: "Notification not found." });
        }

        res.json({ success: true, message: "Notification marked as read." });
    } catch (error) {
        console.error("Error marking notification as read:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// ✅ Delete a notification
router.delete("/deleteNotification/:notificationId", async (req, res) => {
    try {
        const { notificationId } = req.params;

        const notification = await Notification.findByIdAndDelete(notificationId);

        if (!notification) {
            return res.status(404).json({ error: "Notification not found." });
        }

        res.json({ success: true, message: "Notification deleted successfully." });
    } catch (error) {
        console.error("Error deleting notification:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});


module.exports = router;

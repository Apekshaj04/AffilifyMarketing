require('dotenv').config(); // Load environment variables
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const companyRoutes = require('./routes/CompanyRoutes.js'); 
const affiliateRoutes = require('./routes/AffiliateRoutes.js'); 
const notificationRoutes = require('./routes/NotificationRoute.js');
const productRoutes = require('./routes/ProductRoutes.js')
const requestRoutes = require('./routes/RequestNotificationRoute.js')
const transactRoutes = require('./routes/TransactionRoute.js')

const app = express();
app.get("/test",async(req,res)=>{
    console.log("Test route hit");
    res.json({ message: "Test successful" });
})
// ✅ Fix: Explicitly define CORS settings
app.use(cors({
    origin: 'http://localhost:3000',  // Allow requests from frontend
    methods: 'GET, POST, PUT, DELETE',
    allowedHeaders: 'Content-Type, Authorization',
    credentials: true 
}));

// ✅ Handle preflight (OPTIONS) requests properly
app.options('*', cors());

// Middleware
app.use(express.json()); // Built-in alternative to body-parser

// Routes
app.use('/api/company', companyRoutes);
app.use('/api/affiliate', affiliateRoutes);
app.use('/api/product',productRoutes)
app.use('/api/notification',notificationRoutes)
app.use('/api/request',requestRoutes)
app.use('/api/transact',transactRoutes)

const mongoURI = process.env.MONGO_URI ;
console.log(mongoURI)
mongoose.connect(mongoURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    console.log('✅ Connected to MongoDB');
}).catch((error) => {
    console.error('❌ Failed to connect to MongoDB:', error);
    process.exit(1); 
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
    console.log(`🚀 Server is running on port ${PORT}`);
});

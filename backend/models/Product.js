const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name: { type: String, required: true },
    price: { type: Number, required: true },
    category: { type: String, required: true },
    sub_category: { type: String, required: true },
    image: { type: String, required: true },
    link: { type: String, required: true },
    Affiliate: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Affiliate' }],
    Company: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'Company' },
    count: { type: Map, of: Number, default: {} }
});

const Product = mongoose.model('Product', productSchema);
module.exports = Product;

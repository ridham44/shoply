const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  brand: { type: String, required: true },
  price: { type: Number, required: true },
  description: { type: String, required: true },
  product_images: [{ type: String, required: true }],
  rating: { type: Number, default: 0, required: true },
  reviews: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    comment: { type: String, required: true },
    rating: { type: Number, required: true },
    date: { type: Date, default: Date.now, required: true }
  }],
  originalPrice: { type: Number, required: true },
  discount: { type: Number, default: 0, required: true },
  size: { type: String, required: true },
  colour: { type: String, required: true },
  stock: { type: Number, default: 0, required: true },
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
  product_details: { type: String, required: true },
}, { timestamps: true });

module.exports = mongoose.model('Product', productSchema);

// Increment or decrement cart item quantity by productId, colour, and size (userId from token)
exports.updateCartItemQuantity = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { productId, colour, size, action } = req.body;
    if (!productId || !colour || !size || !action) {
      return res.status(400).json({ message: 'Missing required fields' });
    }
    const cart = await Cart.findOne({ user: userId });
    if (!cart) return res.status(404).json({ message: 'Cart not found' });
    const item = cart.items.find(i => i.productId.toString() === productId && i.colour === colour && i.size === size);
    if (!item) return res.status(404).json({ message: 'Product not found in cart' });
    if (action === 'increment') {
      item.quantity = (item.quantity || 1) + 1;
    } else if (action === 'decrement') {
      item.quantity = (item.quantity || 1) - 1;
      if (item.quantity < 1) {
        // Optionally remove item if quantity goes below 1
        cart.items = cart.items.filter(i => !(i.productId.toString() === productId && i.colour === colour && i.size === size));
      }
    } else {
      return res.status(400).json({ message: 'Invalid action' });
    }
    // After any quantity change, update totalPrice for all items in the cart
    cart.items.forEach(i => {
      if (i.price && i.quantity && i.quantity > 0) {
        i.totalPrice = i.price * i.quantity;
      }
    });
    await cart.save();
    res.json(cart);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
// Get cart item by productId, colour, and size (userId from token)
exports.getCartItem = async (req, res) => {
  try {
  const userId = req.user.userId;
    const productId = req.params.productId;
    const colour = req.query.colour;
    const size = req.query.size;
    const cart = await Cart.findOne({ user: userId });
    if (!cart) return res.status(404).json({ message: 'Cart not found' });
    const item = cart.items.find(i => i.productId.toString() === productId && i.colour === colour && i.size === size);
    if (!item) return res.status(404).json({ message: 'Product not found in cart' });
    res.json(item);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update cart item by productId, colour, and size (userId from token)
exports.updateCartItemByProduct = async (req, res) => {
  try {
  const userId = req.user.userId;
    const productId = req.body.productId;
    const colour = req.body.colour;
    const size = req.body.size;
    const update = req.body.update;
    const cart = await Cart.findOne({ user: userId });
    if (!cart) return res.status(404).json({ message: 'Cart not found' });
    const item = cart.items.find(i => i.productId.toString() === productId && i.colour === colour && i.size === size);
    if (!item) return res.status(404).json({ message: 'Product not found in cart' });
    Object.assign(item, update);
    await cart.save();
    res.json(item);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Delete cart item by productId, colour, and size (userId from token)
exports.deleteCartItemByProduct = async (req, res) => {
  try {
  const userId = req.user.userId;
    const productId = req.body.productId;
    const colour = req.body.colour;
    const size = req.body.size;
    const cart = await Cart.findOne({ user: userId });
    if (!cart) return res.status(404).json({ message: 'Cart not found' });
    const itemIndex = cart.items.findIndex(i => i.productId.toString() === productId && i.colour === colour && i.size === size);
    if (itemIndex === -1) return res.status(404).json({ message: 'Product not found in cart' });
    cart.items.splice(itemIndex, 1);
    await cart.save();
    res.json({ message: 'Product removed from cart' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
const mongoose = require('mongoose');
const Cart = require('../models/Cart');

// Create a new cart or add item to existing cart (userId from token)
exports.createOrUpdateCart = async (req, res) => {
  try {
  const userId = req.user.userId;
  let item = req.body.item;
  // Calculate totalPrice = price * quantity
  if (item && item.price && item.quantity) {
    item.totalPrice = item.price * item.quantity;
  }
  let cart = await Cart.findOne({ user: userId });
  if (!cart) {
    cart = new Cart({ user: userId, items: [item] });
  } else {
    cart.items.push(item);
  }
  await cart.save();
  res.status(201).json(cart);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get cart by user (userId from token)
exports.getCart = async (req, res) => {
  try {
  const userId = req.user.userId;
    const carts = await Cart.find({ user: userId });
    if (!carts || carts.length === 0) return res.status(404).json({ message: 'Cart not found' });
    res.json(carts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update cart item (userId from token)
exports.updateCartItem = async (req, res) => {
  try {
  const userId = req.user.userId;
    const itemId = req.body.itemId;
    const update = req.body.update;
    const cart = await Cart.findOne({ user: userId });
    if (!cart) return res.status(404).json({ message: 'Cart not found' });
    const item = cart.items.id(itemId);
    if (!item) return res.status(404).json({ message: 'Item not found' });
    Object.assign(item, update);
    await cart.save();
    res.json(cart);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Delete cart item (userId from token)
exports.deleteCartItem = async (req, res) => {
  try {
  const userId = req.user.userId;
    const itemId = req.body.itemId;
    const cart = await Cart.findOne({ user: userId });
    if (!cart) return res.status(404).json({ message: 'Cart not found' });
    cart.items.id(itemId).remove();
    await cart.save();
    res.json(cart);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Delete entire cart (userId from token)
exports.deleteCart = async (req, res) => {
  try {
    const userId = req.user.userId;
    if (req.body && req.body.productId) {
      // Delete product from cart
      const productId = req.body.productId;
      const colour = req.body.colour;
      const size = req.body.size;
      const cart = await Cart.findOne({ user: userId });
      if (!cart) return res.status(404).json({ message: 'Cart not found' });
      const itemIndex = cart.items.findIndex(i => i.productId.toString() === productId && i.colour === colour && i.size === size);
      if (itemIndex === -1) return res.status(404).json({ message: 'Product not found in cart' });
      cart.items.splice(itemIndex, 1);
      await cart.save();
      return res.json({ message: 'Product removed from cart' });
    } else {
      // Delete entire cart
      await Cart.findOneAndDelete({ user: userId });
      return res.json({ message: 'Cart deleted' });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


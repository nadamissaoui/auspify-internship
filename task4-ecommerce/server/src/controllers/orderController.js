const User = require("../models/User");
const Product = require("../models/Product");
const Order = require("../models/Order");

async function buildCart(user) {
  const populated = await user.populate("cart.product");
  const items = populated.cart
    .filter((item) => item.product)
    .map((item) => ({
      product: item.product._id,
      name: item.product.name,
      price: item.product.price,
      image: item.product.image,
      stock: item.product.stock,
      quantity: item.quantity,
      subtotal: item.product.price * item.quantity,
    }));

  const total = items.reduce((sum, item) => sum + item.subtotal, 0);
  return { items, total, count: items.reduce((sum, i) => sum + i.quantity, 0) };
}

exports.getCart = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const cart = await buildCart(user);
    res.status(200).json(cart);
  } catch (error) {
    res.status(500).json({ message: "Error fetching cart", error: error.message });
  }
};

exports.addToCart = async (req, res) => {
  try {
    const { productId, quantity = 1 } = req.body;
    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ message: "Product not found" });
    if (product.stock < quantity) {
      return res.status(400).json({ message: "Not enough stock available" });
    }

    const user = await User.findById(req.user._id);
    const existing = user.cart.find((item) => item.product.toString() === productId);

    if (existing) {
      existing.quantity += Number(quantity);
    } else {
      user.cart.push({ product: productId, quantity: Number(quantity) });
    }

    await user.save();
    const cart = await buildCart(user);
    res.status(200).json({ message: "Added to cart", cart });
  } catch (error) {
    res.status(500).json({ message: "Error adding to cart", error: error.message });
  }
};

exports.updateCartItem = async (req, res) => {
  try {
    const { quantity } = req.body;
    const user = await User.findById(req.user._id);
    const item = user.cart.find((i) => i.product.toString() === req.params.productId);

    if (!item) return res.status(404).json({ message: "Item not in cart" });
    if (quantity < 1) return res.status(400).json({ message: "Quantity must be at least 1" });

    item.quantity = Number(quantity);
    await user.save();
    const cart = await buildCart(user);
    res.status(200).json({ message: "Cart updated", cart });
  } catch (error) {
    res.status(500).json({ message: "Error updating cart", error: error.message });
  }
};

exports.removeFromCart = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    user.cart = user.cart.filter((i) => i.product.toString() !== req.params.productId);
    await user.save();
    const cart = await buildCart(user);
    res.status(200).json({ message: "Removed from cart", cart });
  } catch (error) {
    res.status(500).json({ message: "Error removing from cart", error: error.message });
  }
};

exports.clearCart = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    user.cart = [];
    await user.save();
    res.status(200).json({ message: "Cart cleared", cart: { items: [], total: 0, count: 0 } });
  } catch (error) {
    res.status(500).json({ message: "Error clearing cart", error: error.message });
  }
};

exports.checkout = async (req, res) => {
  try {
    const { shipping, paymentMethod = "cash" } = req.body;
    if (!shipping || !shipping.fullName || !shipping.address || !shipping.city || !shipping.phone) {
      return res.status(400).json({ message: "Complete shipping information is required" });
    }

    const user = await User.findById(req.user._id);
    const cart = await buildCart(user);
    if (!cart.items.length) {
      return res.status(400).json({ message: "Your cart is empty" });
    }

    for (const item of cart.items) {
      const product = await Product.findById(item.product);
      if (!product || product.stock < item.quantity) {
        return res.status(400).json({ message: `Insufficient stock for ${item.name}` });
      }
    }

    const shippingFee = cart.total > 500 ? 0 : 15;
    const order = await Order.create({
      user: user._id,
      items: cart.items.map((i) => ({
        product: i.product,
        name: i.name,
        price: i.price,
        quantity: i.quantity,
      })),
      shipping,
      paymentMethod,
      itemsTotal: cart.total,
      shippingFee,
      total: cart.total + shippingFee,
    });

    for (const item of cart.items) {
      await Product.findByIdAndUpdate(item.product, { $inc: { stock: -item.quantity } });
    }

    user.cart = [];
    await user.save();

    res.status(201).json({ message: "Order placed successfully", data: order });
  } catch (error) {
    res.status(500).json({ message: "Error placing order", error: error.message });
  }
};

exports.getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.status(200).json({ count: orders.length, data: orders });
  } catch (error) {
    res.status(500).json({ message: "Error fetching orders", error: error.message });
  }
};

exports.getOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: "Order not found" });
    if (order.user.toString() !== req.user._id.toString() && req.user.role !== "admin") {
      return res.status(403).json({ message: "Not allowed to view this order" });
    }
    res.status(200).json({ data: order });
  } catch (error) {
    res.status(500).json({ message: "Error fetching order", error: error.message });
  }
};

// Admin
exports.getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find().populate("user", "name email").sort({ createdAt: -1 });
    res.status(200).json({ count: orders.length, data: orders });
  } catch (error) {
    res.status(500).json({ message: "Error fetching orders", error: error.message });
  }
};

exports.updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const valid = ["pending", "processing", "shipped", "delivered", "cancelled"];
    if (!valid.includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }
    const order = await Order.findByIdAndUpdate(req.params.id, { status }, { new: true });
    if (!order) return res.status(404).json({ message: "Order not found" });
    res.status(200).json({ message: "Order status updated", data: order });
  } catch (error) {
    res.status(500).json({ message: "Error updating order", error: error.message });
  }
};

exports.getAdminStats = async (req, res) => {
  try {
    const totalOrders = await Order.countDocuments();
    const totalProducts = await Product.countDocuments();
    const totalUsers = await User.countDocuments();
    const revenueAgg = await Order.aggregate([
      { $match: { status: { $ne: "cancelled" } } },
      { $group: { _id: null, total: { $sum: "$total" } } },
    ]);
    res.status(200).json({
      totalOrders,
      totalProducts,
      totalUsers,
      revenue: revenueAgg[0]?.total || 0,
    });
  } catch (error) {
    res.status(500).json({ message: "Error fetching stats", error: error.message });
  }
};

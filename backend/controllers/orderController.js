const Order = require('../models/Order');
const Product = require('../models/Product');

exports.addOrderItems = async (req, res) => {
  const { items, shippingAddress, paymentMethod, subtotal, shipping, total } = req.body;
  
  if (!items || items.length === 0) {
    res.status(400).json({ message: 'No order items' });
    return;
  }

  try {
    // 1. Check stock for all items first
    for (const item of items) {
      const product = await Product.findById(item.product);
      if (!product) {
        return res.status(404).json({ message: `Product ${item.name} not found` });
      }
      if (product.stock < item.quantity) {
        return res.status(400).json({ message: `Insufficient stock for ${product.name}. Available: ${product.stock}` });
      }
    }

    // 2. Decrement stock
    for (const item of items) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { stock: -item.quantity }
      });
    }

    // 3. Create order
    const order = new Order({ 
      user: req.user._id, 
      items, 
      shippingAddress, 
      paymentMethod, 
      subtotal, 
      shipping, 
      total 
    });
    
    const createdOrder = await order.save();
    res.status(201).json(createdOrder);

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Order creation failed', error: error.message });
  }
};

exports.getOrderById = async (req, res) => {
  const order = await Order.findById(req.params.id).populate('user', 'name email');
  if (order) res.json(order);
  else res.status(404).json({ message: 'Order not found' });
};

exports.getMyOrders = async (req, res) => {
  const orders = await Order.find({ user: req.user._id });
  res.json(orders);
};

exports.getOrders = async (req, res) => {
  const orders = await Order.find({}).populate('user', 'id name');
  res.json(orders);
};

exports.updateOrderStatus = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });

    const oldStatus = order.status;
    const newStatus = req.body.status || oldStatus;

    // STOCK LOGIC: 
    // 1. If moving TO cancelled from something else -> RESTORE stock
    if (newStatus === 'cancelled' && oldStatus !== 'cancelled') {
      for (const item of order.items) {
        await Product.findByIdAndUpdate(item.product, {
          $inc: { stock: item.quantity }
        });
      }
    }

    // 2. If moving AWAY from cancelled to something else -> DECREMENT stock (check availability first)
    if (newStatus !== 'cancelled' && oldStatus === 'cancelled') {
      // Check stock first
      for (const item of order.items) {
        const product = await Product.findById(item.product);
        if (!product || product.stock < item.quantity) {
          return res.status(400).json({ message: `Cannot re-activate order. Insufficient stock for ${item.name}` });
        }
      }
      // Decrement
      for (const item of order.items) {
        await Product.findByIdAndUpdate(item.product, {
          $inc: { stock: -item.quantity }
        });
      }
    }

    order.status = newStatus;
    const updatedOrder = await order.save();
    res.json(updatedOrder);

  } catch (error) {
    res.status(500).json({ message: 'Failed to update order status', error: error.message });
  }
};

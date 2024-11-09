const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const app = express();
const PORT = 5002;

app.use(cors({ origin: '*' }));
app.use(express.json());

// Connect to MongoDB
mongoose.connect('mongodb://mongodb:27017/ecommerce', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Order schema
const orderSchema = new mongoose.Schema({
  items: [{ productId: String, quantity: Number }],
  createdAt: { type: Date, default: Date.now },
});

const Order = mongoose.model('Order', orderSchema);

// Vulnerability 1: No Authentication (Broken Authentication)
app.post('/order', async (req, res) => {
  // Vulnerability: No user authentication, anyone can place an order
  const { items } = req.body;
  const order = new Order({ items });
  await order.save();
  res.send('Order placed successfully');
});

// Vulnerability 2: No Input Validation (Business Logic Flaw)
app.post('/order', async (req, res) => {
  const { items } = req.body;
  // Vulnerability: No input validation, attacker can send any data
  if (!items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).send('Invalid order data');
  }
  const order = new Order({ items });
  await order.save();
  res.send('Order placed successfully');
});

// Vulnerability 3: No Rate Limiting (Denial of Service)
app.post('/order', async (req, res) => {
  const { items } = req.body;
  const order = new Order({ items });
  await order.save();
  res.send('Order placed successfully');
});

// Vulnerability 4: SQL Injection (MongoDB)
app.get('/orders', async (req, res) => {
  try {
    const { search } = req.query; // No sanitization for search input
    // Vulnerability: Possible injection of malicious MongoDB query via search
    let orders;
    if (search) {
      orders = await Order.find({ 'items.productId': new RegExp(search, 'i') }); // Vulnerable to query manipulation
    } else {
      orders = await Order.find();
    }
    res.json(orders);
  } catch (error) {
    res.status(500).send('Error fetching orders');
  }
});

// Vulnerability 5: Insecure Direct Object References (IDOR)
app.delete('/order/:id', async (req, res) => {
  // Vulnerability: No access control; anyone can delete any order by ID
  const { id } = req.params;
  const order = await Order.findByIdAndDelete(id);
  if (order) {
    res.send('Order deleted successfully');
  } else {
    res.status(404).send('Order not found');
  }
});

// Vulnerability 6: No Data Sanitization (XSS)
app.get('/order/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const order = await Order.findById(id);
    if (order) {
      // Vulnerability: No sanitization of order data before rendering it
      res.send(`<h1>Order ID: ${order._id}</h1><p>Items: ${JSON.stringify(order.items)}</p>`);
    } else {
      res.status(404).send('Order not found');
    }
  } catch (error) {
    res.status(500).send('Error fetching order');
  }
});

app.listen(PORT, () => console.log(`Order service running on port ${PORT}`));

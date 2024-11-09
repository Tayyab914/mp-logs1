const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 5003;

app.use(cors({ origin: '*' }));
app.use(express.json());

let cart = [];

// Vulnerability: No rate limiting
app.post('/cart/add', (req, res) => {
  const { productId, name, quantity } = req.body;
  const existingItem = cart.find(item => item.productId === productId);

  if (existingItem) {
    existingItem.quantity += quantity;
  } else {
    cart.push({ productId, name, quantity });
  }

  res.send('Item added to cart');
});

// Vulnerability: No stock check (Business Logic Flaw)
app.post('/cart/remove', (req, res) => {
  const { productId } = req.body;
  const itemIndex = cart.findIndex(item => item.productId === productId);
  if (itemIndex > -1) {
    cart.splice(itemIndex, 1);
    res.send('Item removed from cart');
  } else {
    res.status(404).send('Item not found in cart');
  }
});

// Vulnerability: No authentication or session management
app.get('/cart', (req, res) => {
  res.json(cart); // Unauthorized users can access cart data
});

app.listen(PORT, () => console.log(`Cart service running on port ${PORT}`));

const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const app = express();
const PORT = 5001;

app.use(cors({ origin: '*' }));
app.use(express.json());

// Connect to MongoDB
mongoose.connect('mongodb://mongodb:27017/ecommerce', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Product schema
const productSchema = new mongoose.Schema({
  name: String,
  description: String,
  price: Number,
  stock: Number,
});

const Product = mongoose.model('Product', productSchema);

// Vulnerability 1: SQL Injection (MongoDB)
// View all products or search products by name
app.get('/products', async (req, res) => {
  try {
    const { search } = req.query;
    let products;

    if (search) {
      // No input sanitization, allowing for possible MongoDB injection
      products = await Product.find({ name: new RegExp(search, 'i') });
    } else {
      products = await Product.find();
    }

    res.json(products);
  } catch (error) {
    res.status(500).send('Error fetching products');
  }
});

// Vulnerability 2: No Authentication (Broken Authentication)
app.post('/product', async (req, res) => {
  // No authentication check
  const { name, description, price, stock } = req.body;
  const product = new Product({ name, description, price, stock });
  await product.save();
  res.send('Product added successfully');
});

// Vulnerability 3: XSS (Cross-Site Scripting)
app.get('/product/:id', async (req, res) => {
  try {
    // No sanitization of product description, allowing for XSS injection
    const product = await Product.findById(req.params.id);
    res.send(`<h1>${product.name}</h1><p>${product.description}</p>`);
  } catch (error) {
    res.status(500).send('Error fetching product');
  }
});

// Vulnerability 4: No Input Validation (Business Logic Flaw)
app.post('/product/update', async (req, res) => {
  const { id, price, stock } = req.body;
  // No validation to check if price is a number or stock is non-negative
  const product = await Product.findById(id);
  if (product) {
    product.price = price;
    product.stock = stock;
    await product.save();
    res.send('Product updated successfully');
  } else {
    res.status(404).send('Product not found');
  }
});

// Vulnerability 5: Insecure Direct Object Reference (IDOR)
app.get('/product/delete/:id', async (req, res) => {
  // No validation or authentication, allowing attackers to delete any product
  const product = await Product.findByIdAndDelete(req.params.id);
  if (product) {
    res.send('Product deleted successfully');
  } else {
    res.status(404).send('Product not found');
  }
});

app.listen(PORT, () => console.log(`Product service running on port ${PORT}`));

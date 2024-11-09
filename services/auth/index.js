const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');

const app = express();
const PORT = 5004;
const JWT_SECRET = 'mysecretkey'; // Replace with a secure key in production

app.use(cors({ origin: '*' }));
app.use(bodyParser.json());

// Connect to MongoDB
mongoose.connect('mongodb://mongodb:27017/ecommerce', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// User schema
const userSchema = new mongoose.Schema({
  username: String,
  password: String,
});

const User = mongoose.model('User', userSchema);

// Vulnerability: No password hashing
app.post('/signup', async (req, res) => {
  const { username, password } = req.body;
  const user = new User({ username, password });
  await user.save();
  res.send('User registered successfully');
});

// Vulnerability: No input validation, and insecure password reset
app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  const user = await User.findOne({ username, password });
  if (!user) return res.status(401).send('Invalid credentials');

  // Vulnerability: No session expiration and insecure session management
  const token = jwt.sign({ username }, JWT_SECRET, { expiresIn: '1h' });
  res.cookie('session', token); // Vulnerable to session hijacking
  res.json({ token });
});

app.listen(PORT, () => console.log(`Auth service running on port ${PORT}`));

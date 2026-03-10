var express = require("express");
var router = express.Router();

const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_SECRET || "mitahara_secret_key";
const User = require("../model/users");

// JWT middleware
function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (!token) return res.status(401).json({ message: "No token provided" });
  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ message: "Invalid token" });
    req.user = user;
    next();
  });
}

/* GET users listing. */
// Protected route example
router.get("/", authenticateToken, function (req, res, next) {
  res.json({ message: "Protected user resource", user: req.user });
});

// Get user's cart
router.get("/cart", authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).populate("cart.id");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json({ cart: user.cart });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// Add item to cart
router.post("/cart", authenticateToken, async (req, res) => {
  const { id, quantity } = req.body;
  if (!id || !quantity) {
    return res
      .status(400)
      .json({ message: "Product ID and quantity required" });
  }
  try {
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    // Check if product already in cart
    const cartItem = user.cart.find((item) => item.id.toString() === id);
    if (cartItem) {
      cartItem.quantity += quantity;
      cartItem.addedAt = new Date();
    } else {
      user.cart.push({ id, quantity });
    }
    await user.save();
    res.status(200).json({ message: "Item added to cart", cart: user.cart });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// Delete item from cart
router.delete("/cart/:id", authenticateToken, async (req, res) => {
  const { id } = req.params;
  try {
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const initialLength = user.cart.length;
    user.cart = user.cart.filter((item) => String(item.id) !== String(id));
    if (user.cart.length === initialLength) {
      return res.status(404).json({ message: "Item not found in cart" });
    }
    await user.save();
    res
      .status(200)
      .json({ message: "Item removed from cart", cart: user.cart });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;

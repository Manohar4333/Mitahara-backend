var mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  cart: [
    {
      id: { type: mongoose.Schema.Types.ObjectId, ref: 'products' },
      quantity: { type: Number, default: 1 },
      addedAt: { type: Date, default: Date.now }
    }
  ],
  createdAt: { type: Date, default: Date.now },
});

var user = mongoose.model("users", userSchema);
module.exports = user;

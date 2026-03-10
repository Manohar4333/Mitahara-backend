var express = require("express");
var router = express.Router();
var products = require("../model/product");
var mongoose = require("mongoose");
const Order = require("../model/orders"); // Importing the orders model
const authRoutes = require("./auth");

/* GET home page. */
router.get("/", function (req, res, next) {
  res.render("index", { title: "Express" });
});

/* ADD Products. */
router.post("/add", (req, res) => {
  var newproduct = new products(req.body);
  console.log(newproduct);
  newproduct
    .save()
    .then(() => res.send({ result: "Success", response: newproduct }))
    .catch((err) => console.log(err));
});

/* Retrive all products */
router.get("/products", (req, res) => {
  products
    .find({})
    .then((docs) => res.send(docs))
    .catch((err) => console.log(err));
});

/*   update Products. */
// router.put("/update/:id", (req, res) => {
//   products
//     .findByIdAndUpdate(req.params.id, req.body)
//     .then((result) => res.send({ status: "Succcess", response: result }))
//     .catch((err) => console.log(err));
// });

router.put("/update/:id", async (req, res) => {
  const idParam = req.params.id;
  try {
    let updatedProduct = null;

    // Try by MongoDB ObjectId when valid
    if (mongoose.Types.ObjectId.isValid(idParam)) {
      updatedProduct = await products.findByIdAndUpdate(idParam, req.body, {
        new: true,
        runValidators: true,
      });
    }

    


    // If not found by _id, and the param is numeric, try the numeric `id` field
    if (!updatedProduct) {
      const numericId = Number(idParam);
      if (!isNaN(numericId)) {
        updatedProduct = await products.findOneAndUpdate(
          { id: numericId },
          req.body,
          {
            new: true,
            runValidators: true,
          },
        );
      }
    }

    if (!updatedProduct) {
      return res
        .status(404)
        .json({ status: "Failed", message: "Product not found" });
    }

    return res
      .status(200)
      .json({ status: "Success", response: updatedProduct });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ status: "Error", message: error.message });
  }
});


/* Delete a product by MongoDB _id or numeric `id` field */
router.delete("/products/:id", async (req, res) => {
  const idParam = req.params.id;
  try {
    let deletedProduct = null;

    // Try by MongoDB ObjectId when valid
    if (mongoose.Types.ObjectId.isValid(idParam)) {
      deletedProduct = await products.findByIdAndDelete(idParam);
    }

    // If not found by _id, and the param is numeric, try the numeric `id` field
    if (!deletedProduct) {
      const numericId = Number(idParam);
      if (!isNaN(numericId)) {
        deletedProduct = await products.findOneAndDelete({ id: numericId });
      }
    }

    if (!deletedProduct) {
      return res
        .status(404)
        .json({ status: "Failed", message: "Product not found" });
    }

    return res.status(200).json({ status: "Success", response: deletedProduct });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ status: "Error", message: error.message });
  }
});



/* get by product category */
router.get("/products/:category", (req, res) => {
  products
    .find({ category: req.params.category })
    .then((ooo) => res.send(ooo))
    .catch((err) => console.log(err));
});

/* Place an order */
router.post("/orders", (req, res) => {
  const { userId, orderId, Items, totalAmount, orderStatus } = req.body;

  // Validate the request body
  if (
    !userId ||
    !orderId ||
    !Items ||
    Items.length === 0 ||
    !totalAmount ||
    !orderStatus
  ) {
    return res.status(400).send({ error: "Invalid order details." });
  }

  // Create a new order
  const newOrder = new Order({
    userId,
    orderId,
    Items,
    totalAmount,
    orderStatus,
  });

  // Save the order to the database
  newOrder
    .save()
    .then((result) =>
      res
        .status(201)
        .send({ message: "Order placed successfully.", order: result }),
    )
    .catch((err) => {
      console.error(err);
      res.status(500).send({ error: "Failed to place order." });
    });
});

module.exports = router;

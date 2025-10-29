const express = require("express");
const ProductController = require("../controllers/ProductController");
const auth = require("../middleware/auth");
const router = express.Router();

// Create product
router.post("/products", ProductController.createProduct);

// Get all products
router.get("/products", ProductController.getProducts);

// Get single product
router.get("/products/:id", ProductController.getProductById);

// Update product
router.put("/products/:id", auth, ProductController.updateProduct);

// Delete product
router.delete("/products/:id", auth, ProductController.deleteProduct);

module.exports = router;

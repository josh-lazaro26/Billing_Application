const db = require("../config/db");

// Helper to handle base64 to buffer conversion
function base64ToBuffer(dataUrl) {
  if (!dataUrl) return null;
  // Handle both data URLs (with prefix) and raw base64
  const base64 = dataUrl.replace(/^data:image\/\w+;base64,/, "");
  return Buffer.from(base64, "base64");
}

// Create a new product
exports.createProduct = (req, res) => {
  const {
    productName,
    productDescription,
    productImage, // base64 string expected
    productPrice,
    productStocks,
    category,
  } = req.body;

  // Basic field validation
  if (!productName || !productPrice || !productStocks || !productImage) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  const productImageBuffer = base64ToBuffer(productImage);

  const insertProduct = `
    INSERT INTO products 
    (productName, productDescription, productImage, productPrice, productStocks, category)
    VALUES (?, ?, ?, ?, ?, ?)`;

  db.query(
    insertProduct,
    [
      productName,
      productDescription,
      productImageBuffer,
      productPrice,
      productStocks,
      category,
    ],
    (err, result) => {
      if (err) {
        console.error("Insert error:", err);
        return res.status(500).json({ message: "Error inserting product" });
      }
      return res.status(201).json({
        message: "Product added successfully",
        product_id: result.insertId,
      });
    }
  );
};

// Get all products; return productImage as base64 data URL for frontend use
exports.getProducts = (req, res) => {
  const query = `
    SELECT * FROM products 
    WHERE isActive = TRUE 
      AND productStocks > 0
  `;

  db.query(query, (err, results) => {
    if (err) {
      console.error("Error getting products:", err);
      return res.status(500).json({ message: "Database error" });
    }

    const products = results.map((product) => ({
      ...product,
      productImage: product.productImage
        ? `data:image/jpeg;base64,${product.productImage.toString("base64")}`
        : null,
    }));

    res.status(200).json(products);
  });
};

// Get single product by ID
exports.getProductById = (req, res) => {
  const { product_id } = req.params;
  db.query(
    "SELECT * FROM products WHERE product_id = ? AND isActive=TRUE",
    [product_id],
    (err, results) => {
      if (err) {
        console.error("Error getting product:", err);
        return res.status(500).json({ message: "Database error" });
      }
      if (results.length === 0) {
        return res.status(404).json({ message: "Product not found" });
      }
      // Convert BLOB to base64 URL for frontend
      const product = results[0];
      product.productImage = product.productImage
        ? `data:image/jpeg;base64,${product.productImage.toString("base64")}`
        : null;
      res.status(200).json(product);
    }
  );
};

// Update product
exports.updateProduct = (req, res) => {
  const { product_id } = req.params;
  const {
    productName,
    productDescription,
    productImage, // base64 string, may be omitted
    productPrice,
    productStocks,
    category,
    isActive,
  } = req.body;

  let updateSQL = `
    UPDATE products SET 
      productName=?, productDescription=?,
      productPrice=?, productStocks=?, category=?, isActive=?`;
  let params = [
    productName,
    productDescription,
    productPrice,
    productStocks,
    category,
    isActive ?? true,
  ];

  // If a new image is provided, update it
  if (productImage) {
    updateSQL += `, productImage=?`;
    params.push(base64ToBuffer(productImage));
  }

  updateSQL += " WHERE product_id=?";
  params.push(product_id);

  db.query(updateSQL, params, (err) => {
    if (err) {
      console.error("Error updating product:", err);
      return res.status(500).json({ message: "Database error" });
    }
    res.status(200).json({ message: "Product updated" });
  });
};

// "Soft" delete product (set isActive to false)
exports.deleteProduct = (req, res) => {
  const { product_id } = req.params;
  db.query(
    `UPDATE products SET isActive=FALSE WHERE product_id=?`,
    [product_id],
    (err) => {
      if (err) {
        console.error("Error deleting product:", err);
        return res.status(500).json({ message: "Database error" });
      }
      res.status(200).json({ message: "Product deleted" });
    }
  );
};

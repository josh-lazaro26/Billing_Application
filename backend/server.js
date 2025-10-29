const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
require("dotenv").config();

const app = express();

// Import routes
const userRoutes = require("./routes/userRoutes");
const productRoutes = require("./routes/productRoute");
const billingRoutes = require("./routes/billingRoute");

// Configure CORS
const corsOptions = {
  origin: [process.env.FRONTEND_URL1 || "http://localhost:5173"],
  credentials: true,
  allowedHeaders: ["Content-Type", "Authorization"],
};

app.use(cors(corsOptions));
app.use(bodyParser.json({ limit: "10mb" }));
app.use(bodyParser.urlencoded({ limit: "10mb", extended: true }));
app.use(express.json({ limit: "10mb" }));

// Mount routes
app.use("/users", userRoutes);
app.use("/stocks", productRoutes);
app.use("/bills", billingRoutes);

// Start server
const PORT = process.env.PORT || 8081;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

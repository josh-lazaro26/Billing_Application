const db = require("../config/db");

// 🧾 Create a new billing (checkout)
exports.createBilling = (req, res) => {
  const { user_id, cart, subtotal, tax, total } = req.body;

  if (!cart || !Array.isArray(cart) || cart.length === 0) {
    return res.status(400).json({ message: "Cart is empty." });
  }

  // Step 1: Insert billing record
  const billingSQL = `
    INSERT INTO billings (user_id, subtotal, tax, total)
    VALUES (?, ?, ?, ?)
  `;

  db.query(
    billingSQL,
    [user_id || null, subtotal, tax, total],
    (err, result) => {
      if (err) {
        console.error("❌ Error inserting billing:", err);
        return res.status(500).json({ message: "Error creating billing" });
      }

      const billing_id = result.insertId;

      // Step 2: Insert billing items
      const itemsValues = cart.map((item) => [
        billing_id,
        item.product_id,
        item.quantity,
        item.unit_price,
        item.quantity * item.unit_price,
      ]);

      const itemsSQL = `
      INSERT INTO billing_items (billing_id, product_id, quantity, unit_price, line_total)
      VALUES ?
    `;

      db.query(itemsSQL, [itemsValues], (err2) => {
        if (err2) {
          console.error("❌ Error inserting billing items:", err2);
          return res
            .status(500)
            .json({ message: "Error adding billing items" });
        }

        // Step 3: Deduct stocks for each product
        const updateStockSQL = `
        UPDATE products 
        SET productStocks = productStocks - ? 
        WHERE product_id = ?
      `;

        cart.forEach((item) => {
          db.query(updateStockSQL, [item.quantity, item.product_id]);
        });

        // Step 4: Fetch billing preview (with user + items)
        const billingDetailsSQL = `
        SELECT 
          b.*, 
          CONCAT(u.firstName, ' ', u.lastName) AS fullName
        FROM billings b
        LEFT JOIN users u ON b.user_id = u.user_id
        WHERE b.billing_id = ?
      `;

        db.query(billingDetailsSQL, [billing_id], (err3, billingRows) => {
          if (err3) {
            console.error("❌ Error fetching billing details:", err3);
            return res
              .status(500)
              .json({ message: "Error fetching billing preview" });
          }

          const billing = billingRows[0];

          const itemsQuery = `
          SELECT bi.*, p.productName
          FROM billing_items bi
          JOIN products p ON bi.product_id = p.product_id
          WHERE bi.billing_id = ?
        `;

          db.query(itemsQuery, [billing_id], (err4, itemsRows) => {
            if (err4) {
              console.error("❌ Error fetching billing items:", err4);
              return res
                .status(500)
                .json({ message: "Error fetching billing items" });
            }

            res.status(201).json({
              message: "✅ Transaction completed successfully",
              billing,
              items: itemsRows,
            });
          });
        });
      });
    }
  );
};

// 📄 Get billing by ID
exports.getBillingById = (req, res) => {
  const { billing_id } = req.params;

  const billingDetailsSQL = `
    SELECT 
      b.*, 
      CONCAT(u.firstName, ' ', u.lastName) AS fullName
    FROM billings b
    LEFT JOIN users u ON b.user_id = u.user_id
    WHERE b.billing_id = ?
  `;

  db.query(billingDetailsSQL, [billing_id], (err, billingRows) => {
    if (err) {
      console.error("❌ Error fetching billing:", err);
      return res
        .status(500)
        .json({ message: "Error fetching billing preview" });
    }

    if (billingRows.length === 0) {
      return res.status(404).json({ message: "Billing not found" });
    }

    const billing = billingRows[0];

    const itemsSQL = `
      SELECT bi.*, p.productName
      FROM billing_items bi
      JOIN products p ON bi.product_id = p.product_id
      WHERE bi.billing_id = ?
    `;

    db.query(itemsSQL, [billing_id], (err2, itemsRows) => {
      if (err2) {
        console.error("❌ Error fetching billing items:", err2);
        return res
          .status(500)
          .json({ message: "Error fetching billing items" });
      }

      res.json({
        billing,
        items: itemsRows,
      });
    });
  });
};

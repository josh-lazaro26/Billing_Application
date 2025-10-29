const express = require("express");
const router = express.Router();
const billingController = require("../controllers/BillingController");

router.post("/billings", billingController.createBilling);
router.get("/billings/:billing_id", billingController.getBillingById);

module.exports = router;

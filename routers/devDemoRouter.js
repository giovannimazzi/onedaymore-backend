const express = require("express");
const router = express.Router();
const devDemoController = require("../controllers/devDemoController");

router.get("/state", devDemoController.state);
router.post("/payment-mode", devDemoController.setPaymentMode);
router.post("/stock", devDemoController.setStock);
router.post("/reset", devDemoController.reset);

module.exports = router;

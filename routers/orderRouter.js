const express = require("express");
const router = express.Router();
const orderController = require("../controllers/orderController");

router.get("/", orderController.index);
router.get("/:order_number", orderController.show);
router.post("/", orderController.store);
router.put("/:order_number", orderController.update);
router.patch("/:order_number", orderController.modify);
router.delete("/:order_number", orderController.destroy);

module.exports = router;

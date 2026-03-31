const express = require("express");
const router = express.Router();
const orderProductController = require("../controllers/orderProductController");

router.get("/", orderProductController.index);
router.get("/:id", orderProductController.show);
router.post("/", orderProductController.store);
router.put("/:id", orderProductController.update);
router.patch("/:id", orderProductController.modify);
router.delete("/:id", orderProductController.destroy);

module.exports = router;

const express = require("express");
const router = express.Router();
const productController = require("../controllers/productController");

router.get("/u/homepage", productController.homepage);
router.get("/", productController.index);
router.get("/:slug", productController.show);

router.post("/u/availability", productController.availability);
router.post("/", productController.store);

router.put("/:slug", productController.update);
router.patch("/:slug", productController.modify);
router.delete("/:slug", productController.destroy);

module.exports = router;

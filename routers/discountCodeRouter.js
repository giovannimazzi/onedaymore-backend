const express = require("express");
const router = express.Router();
const discountCodeController = require("../controllers/discountCodeController");

router.get("/", discountCodeController.index);
router.get("/:id", discountCodeController.show);
router.post("/", discountCodeController.store);
router.put("/:id", discountCodeController.update);
router.patch("/:id", discountCodeController.modify);
router.delete("/:id", discountCodeController.destroy);

module.exports = router;

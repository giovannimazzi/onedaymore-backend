const express = require("express");
const router = express.Router();
const discountCodeController = require("../controllers/discountCodeController");

router.post("/validate", discountCodeController.validate);

router.get("/", discountCodeController.index);
router.get("/:code", discountCodeController.show);

router.post("/", discountCodeController.store);
router.put("/:code", discountCodeController.update);
router.patch("/:code", discountCodeController.modify);
router.delete("/:code", discountCodeController.destroy);

module.exports = router;

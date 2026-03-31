const express = require("express");
const router = express.Router();
const categoryController = require("../controllers/categoryController");

router.get("/", categoryController.index);
router.get("/:slug", categoryController.show);
router.post("/", categoryController.store);
router.put("/:slug", categoryController.update);
router.patch("/:slug", categoryController.modify);
router.delete("/:slug", categoryController.destroy);

module.exports = router;

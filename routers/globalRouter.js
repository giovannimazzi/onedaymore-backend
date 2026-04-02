const express = require("express");
const router = express.Router();

router.get("/", (req, res) => {
  const baseUrl = `${process.env.APP_URL}:${process.env.APP_PORT}`;

  res.json({
    message: "-Welcome to OneDayMore API-",
    base_url: baseUrl,
    endpoints: {
      products: {
        list: `${baseUrl}/products`,
        detail: `${baseUrl}/products/:slug`,
        homepage: `${baseUrl}/products/u/homepage`,
        availability: `${baseUrl}/products/u/availability`,
      },
      categories: {
        list: `${baseUrl}/categories`,
        detail: `${baseUrl}/categories/:slug`,
      },
      discount_codes: {
        validate: `${baseUrl}/discount-codes/validate`,
        get_by_code: `${baseUrl}/discount-codes/:code`,
      },
      orders: {
        create: `${baseUrl}/orders`,
        list: `${baseUrl}/orders`,
        detail: `${baseUrl}/orders/:order_number`,
      },
    },
  });
});

module.exports = router;

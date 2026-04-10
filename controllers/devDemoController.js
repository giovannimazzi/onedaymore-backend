const connection = require("../database/conn");
const { handleFailedQuery } = require("../utils/database");
const {
  isDevMode,
  getPaymentMode,
  setPaymentMode,
  resetDemoState,
  getInitialStockBySlug,
} = require("../utils/devDemoState");

function ensureDevMode(res) {
  if (!isDevMode()) {
    res.status(404).json({ message: "Not found" });
    return false;
  }

  return true;
}

function state(req, res) {
  if (!ensureDevMode(res)) return;

  res.json({
    result: {
      payment_mode: getPaymentMode(),
      available_payment_modes: ["default", "always_success", "always_fail"],
      stock_presets: [0, 1, 10, 15],
      tracked_products: Object.keys(getInitialStockBySlug()),
    },
  });
}

function setPaymentModeHandler(req, res) {
  if (!ensureDevMode(res)) return;

  const { mode } = req.body;

  const allowedModes = ["default", "always_success", "always_fail"];

  if (!allowedModes.includes(mode)) {
    return res.status(400).json({
      message:
        "Validation failed: mode must be one of default, always_success, always_fail",
    });
  }

  setPaymentMode(mode);

  res.json({
    message: "Dev payment mode updated",
    result: {
      payment_mode: getPaymentMode(),
    },
  });
}

function setStock(req, res) {
  if (!ensureDevMode(res)) return;

  const { slug, quantity_available } = req.body;

  if (typeof slug !== "string" || slug.trim() === "") {
    return res.status(400).json({
      message: "Validation failed: slug is required",
    });
  }

  const parsedQuantity = Number(quantity_available);

  if (!Number.isInteger(parsedQuantity) || parsedQuantity < 0) {
    return res.status(400).json({
      message:
        "Validation failed: quantity_available must be an integer greater than or equal to 0",
    });
  }

  const selectSQL = `
    SELECT
      id,
      slug,
      name,
      quantity_available
    FROM onedaymore.products
    WHERE slug = ?
    LIMIT 1;`;

  connection.query(selectSQL, [slug.trim()], (err, result) => {
    if (err) return handleFailedQuery(err, res);

    const product = result[0];

    if (!product) {
      return res.status(404).json({
        message: "Product not found",
      });
    }

    const updateSQL = `
      UPDATE onedaymore.products
      SET quantity_available = ?
      WHERE id = ?;`;

    connection.query(updateSQL, [parsedQuantity, product.id], (updateErr) => {
      if (updateErr) return handleFailedQuery(updateErr, res);

      res.json({
        message: "Dev stock updated",
        result: {
          slug: product.slug,
          name: product.name,
          old_quantity_available: product.quantity_available,
          new_quantity_available: parsedQuantity,
        },
      });
    });
  });
}

function reset(req, res) {
  if (!ensureDevMode(res)) return;

  resetDemoState();

  const initialStockBySlug = getInitialStockBySlug();
  const entries = Object.entries(initialStockBySlug);

  if (entries.length === 0) {
    return res.json({
      message: "Dev demo reset completed",
      result: {
        payment_mode: getPaymentMode(),
        reset_products: [],
      },
    });
  }

  const resetPromises = entries.map(([slug, quantity]) => {
    return new Promise((resolve, reject) => {
      const updateSQL = `
        UPDATE onedaymore.products
        SET quantity_available = ?
        WHERE slug = ?;`;

      connection.query(updateSQL, [quantity, slug], (err) => {
        if (err) reject(err);
        else {
          resolve({
            slug,
            quantity_available: quantity,
          });
        }
      });
    });
  });

  Promise.all(resetPromises)
    .then((resetProducts) => {
      res.json({
        message: "Dev demo reset completed",
        result: {
          payment_mode: getPaymentMode(),
          reset_products: resetProducts,
        },
      });
    })
    .catch((err) => handleFailedQuery(err, res));
}

module.exports = {
  state,
  setPaymentMode: setPaymentModeHandler,
  setStock,
  reset,
};

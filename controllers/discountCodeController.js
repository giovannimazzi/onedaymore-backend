const connection = require("../database/conn");
const {
  handleFailedQuery,
  handleResourceNotFound,
} = require("../utils/database");

function index(req, res) {
  const discountCodesSQL = `
    SELECT
      id,
      code,
      description,
      discount_type,
      discount_value,
      min_order_amount,
      starts_at,
      ends_at,
      is_active,
      created_at,
      updated_at
    FROM onedaymore.discount_codes
    ORDER BY starts_at ASC;`;

  connection.query(discountCodesSQL, (err, result) => {
    if (err) return handleFailedQuery(err, res);

    res.json({ result });
  });
}

function show(req, res) {
  const { id } = req.params;

  const discountCodeSQL = `
    SELECT
      id,
      code,
      description,
      discount_type,
      discount_value,
      min_order_amount,
      starts_at,
      ends_at,
      is_active,
      created_at,
      updated_at
    FROM onedaymore.discount_codes
    WHERE id = ?;`;

  connection.query(discountCodeSQL, [id], (err, result) => {
    if (err) return handleFailedQuery(err, res);

    const discountCode = result[0];
    if (!discountCode) return handleResourceNotFound(res);

    res.json({ result: discountCode });
  });
}

function validate(req, res) {
  const { code, subtotal } = req.body;

  if (!code || subtotal === undefined || Number.isNaN(Number(subtotal))) {
    return res.status(400).json({
      message: "Code and subtotal are required",
    });
  }

  const numericSubtotal = Number(subtotal);

  const discountSQL = `
    SELECT
      id,
      code,
      description,
      discount_type,
      discount_value,
      min_order_amount,
      starts_at,
      ends_at,
      is_active
    FROM onedaymore.discount_codes
    WHERE code = ?
      AND is_active = 1
      AND NOW() BETWEEN starts_at AND ends_at;`;

  connection.query(discountSQL, [code], (err, result) => {
    if (err) return handleFailedQuery(err, res);

    const discount = result[0];

    if (!discount) {
      return res.json({
        result: {
          is_valid: false,
          message: "Discount code is invalid or expired",
          discount_amount: 0,
          final_total: numericSubtotal,
        },
      });
    }

    if (
      discount.min_order_amount !== null &&
      numericSubtotal < Number(discount.min_order_amount)
    ) {
      return res.json({
        result: {
          is_valid: false,
          message: `Minimum order amount not reached`,
          discount_amount: 0,
          final_total: numericSubtotal,
          min_order_amount: Number(discount.min_order_amount),
        },
      });
    }

    let discountAmount = 0;

    if (discount.discount_type === "percentage") {
      discountAmount =
        (numericSubtotal * Number(discount.discount_value)) / 100;
    } else {
      discountAmount = Number(discount.discount_value);
    }

    if (discountAmount > numericSubtotal) {
      discountAmount = numericSubtotal;
    }

    return res.json({
      result: {
        is_valid: true,
        message: "Discount code is valid",
        code: discount.code,
        discount_type: discount.discount_type,
        discount_value: Number(discount.discount_value),
        discount_amount: discountAmount,
        final_total: numericSubtotal - discountAmount,
        min_order_amount:
          discount.min_order_amount !== null
            ? Number(discount.min_order_amount)
            : null,
      },
    });
  });
}

function store(req, res) {
  res.json({ message: "WIP" });
}

function update(req, res) {
  res.json({ message: "WIP" });
}

function modify(req, res) {
  res.json({ message: "WIP" });
}

function destroy(req, res) {
  res.json({ message: "WIP" });
}

module.exports = {
  index,
  show,
  validate,
  store,
  update,
  modify,
  destroy,
};

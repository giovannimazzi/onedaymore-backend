const connection = require("../database/conn");
const {
  handleFailedQuery,
  handleResourceNotFound,
} = require("../utils/database");

function index(req, res) {
  const ordersSQL = `
    SELECT
      id,
      discount_code_id,
      order_number,
      customer_email,
      customer_first_name,
      customer_last_name,
      phone,
      billing_address_line1,
      billing_address_line2,
      billing_city,
      billing_postal_code,
      billing_province,
      billing_country,
      shipping_address_line1,
      shipping_address_line2,
      shipping_city,
      shipping_postal_code,
      shipping_province,
      shipping_country,
      subtotal_amount,
      discount_amount,
      shipping_amount,
      total_amount,
      placed_at,
      status,
      created_at,
      updated_at
    FROM onedaymore.orders
    ORDER BY created_at DESC;`;

  connection.query(ordersSQL, (err, result) => {
    if (err) return handleFailedQuery(err, res);

    res.json({
      result,
    });
  });
}

function show(req, res) {
  const { order_number } = req.params;

  const orderSQL = `
    SELECT
      id,
      discount_code_id,
      order_number,
      customer_email,
      customer_first_name,
      customer_last_name,
      phone,
      billing_address_line1,
      billing_address_line2,
      billing_city,
      billing_postal_code,
      billing_province,
      billing_country,
      shipping_address_line1,
      shipping_address_line2,
      shipping_city,
      shipping_postal_code,
      shipping_province,
      shipping_country,
      subtotal_amount,
      discount_amount,
      shipping_amount,
      total_amount,
      placed_at,
      status,
      created_at,
      updated_at
    FROM onedaymore.orders
    WHERE order_number = ?;`;

  connection.query(orderSQL, [order_number], (err, result) => {
    if (err) return handleFailedQuery(err, res);

    const order = result[0];
    if (!order) return handleResourceNotFound(res);

    const orderProductsSQL = `
      SELECT
        product_name,
        unit_price,
        quantity
      FROM onedaymore.order_product
      WHERE order_id = ?;`;

    connection.query(
      orderProductsSQL,
      [order.id],
      (err, orderProductsResult) => {
        if (err) return handleFailedQuery(err, res);

        res.json({
          result: {
            ...order,
            items: orderProductsResult,
          },
        });
      },
    );
  });
}

function store(req, res) {
  const {
    customer_email,
    customer_first_name,
    customer_last_name,
    phone = null,
    billing_address_line1,
    billing_address_line2 = null,
    billing_city,
    billing_postal_code,
    billing_province = null,
    billing_country,
    shipping_address_line1,
    shipping_address_line2 = null,
    shipping_city,
    shipping_postal_code,
    shipping_province = null,
    shipping_country,
    items,
    discount_code,
  } = req.body;

  // 1. Validazione minima dei campi richiesti (da fare più approfondita?)
  if (
    !customer_email ||
    !customer_first_name ||
    !customer_last_name ||
    !billing_address_line1 ||
    !billing_city ||
    !billing_postal_code ||
    !billing_country ||
    !shipping_address_line1 ||
    !shipping_city ||
    !shipping_postal_code ||
    !shipping_country ||
    !Array.isArray(items) ||
    items.length === 0
  ) {
    return res.status(400).json({
      message: "Missing required fields",
    });
  }

  // 2. Normalizzazione e validazione base degli items
  const normalizedItems = items
    .map((item) => ({
      slug: String(item.slug || "").trim(),
      quantity: Number(item.quantity),
    }))
    .filter(
      (item) =>
        item.slug.length > 0 &&
        Number.isInteger(item.quantity) &&
        item.quantity > 0,
    );

  if (normalizedItems.length !== items.length) {
    return res.status(400).json({
      message:
        "Each item must contain a valid slug and quantity greater than 0",
    });
  }

  const slugs = [...new Set(normalizedItems.map((item) => item.slug))];
  const placeholders = slugs.map(() => "?").join(",");

  // 3. Recupero prodotti dal DB per:
  // - verificare che esistano
  // - controllare lo stock
  // - recuperare prezzo e nome al momento dell'ordine
  const productsSQL = `
    SELECT
      id,
      slug,
      name,
      price,
      quantity_available,
      is_active
    FROM onedaymore.products
    WHERE slug IN (${placeholders});`;

  connection.query(productsSQL, slugs, (err, productsResult) => {
    if (err) return handleFailedQuery(err, res);

    const productsMap = new Map(
      productsResult.map((product) => [product.slug, product]),
    );

    let subtotal = 0;

    // 4. Controllo disponibilità prodotti e calcolo subtotale
    for (const item of normalizedItems) {
      const product = productsMap.get(item.slug);

      if (!product) {
        return res.status(400).json({
          message: "A selected product was not found",
        });
      }

      if (!product.is_active) {
        return res.status(400).json({
          message: `Product ${product.name} is not available`,
        });
      }

      if (product.quantity_available < item.quantity) {
        return res.status(400).json({
          message: `Not enough stock for product ${product.name}`,
        });
      }

      subtotal += Number(product.price) * item.quantity;
    }

    // 5. Gestione facoltativa del codice sconto
    let discountAmount = 0;
    let discountCodeId = null;

    if (discount_code) {
      const discountSQL = `
        SELECT
          id,
          code,
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

      connection.query(discountSQL, [discount_code], (err, discountResult) => {
        if (err) return handleFailedQuery(err, res);

        const discount = discountResult[0];

        if (discount) {
          if (
            discount.min_order_amount === null ||
            subtotal >= Number(discount.min_order_amount)
          ) {
            discountCodeId = discount.id;

            if (discount.discount_type === "percentage") {
              discountAmount =
                (subtotal * Number(discount.discount_value)) / 100;
            } else {
              discountAmount = Number(discount.discount_value);
            }

            if (discountAmount > subtotal) {
              discountAmount = subtotal;
            }
          }
        }

        createOrder(discountCodeId, discountAmount);
      });
    } else {
      createOrder(discountCodeId, discountAmount);
    }

    // 6. Creazione ordine
    function createOrder(discountCodeId, discountAmount) {
      const freeShippingThreshold = Number(process.env.FREE_SHIPPING_THRESHOLD);
      const standardShippingCost = Number(process.env.STANDARD_SHIPPING_COST);

      const shippingAmount =
        subtotal >= freeShippingThreshold ? 0 : standardShippingCost;

      const totalAmount = subtotal - discountAmount + shippingAmount;

      const simulatedStatus =
        Math.random() < 0.8 ? "confirmed" : "payment_failed";

      const orderNumber = generateOrderNumber();

      const orderSQL = `
        INSERT INTO onedaymore.orders (
          discount_code_id,
          order_number,
          customer_email,
          customer_first_name,
          customer_last_name,
          phone,
          billing_address_line1,
          billing_address_line2,
          billing_city,
          billing_postal_code,
          billing_province,
          billing_country,
          shipping_address_line1,
          shipping_address_line2,
          shipping_city,
          shipping_postal_code,
          shipping_province,
          shipping_country,
          subtotal_amount,
          discount_amount,
          shipping_amount,
          total_amount,
          placed_at,
          status,
          customer_email_sent,
          vendor_email_sent
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), ?, 0, 0);`;

      const orderValues = [
        discountCodeId,
        orderNumber,
        customer_email,
        customer_first_name,
        customer_last_name,
        phone,
        billing_address_line1,
        billing_address_line2,
        billing_city,
        billing_postal_code,
        billing_province,
        billing_country,
        shipping_address_line1,
        shipping_address_line2,
        shipping_city,
        shipping_postal_code,
        shipping_province,
        shipping_country,
        subtotal,
        discountAmount,
        shippingAmount,
        totalAmount,
        simulatedStatus,
      ];

      connection.query(orderSQL, orderValues, (err, orderResult) => {
        if (err) return handleFailedQuery(err, res);

        const orderId = orderResult.insertId;

        // TODO: Email handling (future implementation)
        // After order creation, especially for confirmed orders, the flow should:
        // 1. Send confirmation email to the customer
        // 2. Send notification email to the vendor
        // 3. Update the related flags in orders table:
        //    - customer_email_sent = 1 if customer email is sent successfully
        //    - vendor_email_sent = 1 if vendor email is sent successfully
        // For now email handling is intentionally not implemented,
        // so both flags remain 0 as a reminder for future development.

        if (simulatedStatus === "payment_failed") {
          return res.status(201).json({
            message: "Order created but payment failed",
            result: {
              order_number: orderNumber,
              status: simulatedStatus,
              subtotal_amount: subtotal,
              discount_amount: discountAmount,
              shipping_amount: shippingAmount,
              total_amount: totalAmount,
            },
          });
        }

        // 8. Se il pagamento è confermato, creo le righe "scontrino"
        const orderItemsSQL = `
          INSERT INTO onedaymore.order_product (
            product_id,
            order_id,
            product_name,
            unit_price,
            quantity
          ) VALUES ?;`;

        const orderItemsValues = normalizedItems.map((item) => {
          const product = productsMap.get(item.slug);

          return [
            product.id,
            orderId,
            product.name,
            Number(product.price),
            item.quantity,
          ];
        });

        connection.query(orderItemsSQL, [orderItemsValues], (err) => {
          if (err) return handleFailedQuery(err, res);

          // 9. Aggiorno lo stock solo per ordini confermati
          const updatePromises = normalizedItems.map((item) => {
            return new Promise((resolve, reject) => {
              const product = productsMap.get(item.slug);

              const updateStockSQL = `
                UPDATE onedaymore.products
                SET quantity_available = quantity_available - ?
                WHERE id = ?;`;

              connection.query(
                updateStockSQL,
                [item.quantity, product.id],
                (err) => {
                  if (err) reject(err);
                  else resolve();
                },
              );
            });
          });

          Promise.all(updatePromises)
            .then(() => {
              res.status(201).json({
                message: "Order created successfully",
                result: {
                  order_number: orderNumber,
                  status: simulatedStatus,
                  subtotal_amount: subtotal,
                  discount_amount: discountAmount,
                  shipping_amount: shippingAmount,
                  total_amount: totalAmount,
                },
              });
            })
            .catch((err) => handleFailedQuery(err, res));
        });
      });
    }
  });
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
  store,
  update,
  modify,
  destroy,
};

function generateOrderNumber() {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 10000)
    .toString()
    .padStart(4, "0");

  return `ODM-${timestamp}-${random}`;
}

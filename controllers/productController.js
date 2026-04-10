const connection = require("../database/conn");
const {
  handleFailedQuery,
  handleResourceNotFound,
} = require("../utils/database");
const { roundCurrency } = require("../utils/financial");

function homepage(req, res) {
  const latestArrivalsSQL = buildProductsSQL({
    extraWhere: "AND latest.slug IS NOT NULL",
    orderBy: "products.created_at DESC",
    limitClause: "LIMIT 8",
  });

  const bestSellersSQL = buildProductsSQL({
    extraWhere: "AND best.slug IS NOT NULL",
    orderBy: "total_sold DESC, products.created_at DESC",
    limitClause: "LIMIT 8",
  });

  connection.query(latestArrivalsSQL, (latestErr, latestResult) => {
    if (latestErr) return handleFailedQuery(latestErr, res);

    connection.query(bestSellersSQL, (bestErr, bestResult) => {
      if (bestErr) return handleFailedQuery(bestErr, res);

      res.json({
        result: {
          latest_arrivals: latestResult.map((product) =>
            mapPublicProduct(product),
          ),
          best_sellers: bestResult.map((product) => mapPublicProduct(product)),
        },
      });
    });
  });
}

function index(req, res) {
  const {
    search = "",
    category = "",
    sort = "created_at",
    order = "desc",
    limit,
    preparation_type,
    min_price,
    max_price,
    min_calories,
    max_calories,
    min_weight_grams,
    max_weight_grams,
    min_servings,
    max_servings,
    min_storage_life_months,
    max_storage_life_months,
    min_water_needed_ml,
    max_water_needed_ml,
    min_quantity_available,
    max_quantity_available,
  } = req.query;

  const allowedSortFields = {
    name: "products.name",
    price: "products.price",
    created_at: "products.created_at",
    calories: "products.calories",
    weight_grams: "products.weight_grams",
    servings: "products.servings",
    storage_life_months: "products.storage_life_months",
    water_needed_ml: "products.water_needed_ml",
    total_sold: "total_sold",
  };

  const normalizedSort =
    allowedSortFields[sort] || allowedSortFields.created_at;

  const normalizedOrder =
    String(order).toLowerCase() === "asc" ? "ASC" : "DESC";

  const queryParams = [];
  let extraWhere = "";

  if (search.trim()) {
    extraWhere += `
      AND (
        products.name LIKE ?
        OR products.short_description LIKE ?
        OR products.description LIKE ?
        OR products.brand LIKE ?
        OR categories.name LIKE ?
      )`;
    const likeSearch = `%${search.trim()}%`;
    queryParams.push(
      likeSearch,
      likeSearch,
      likeSearch,
      likeSearch,
      likeSearch,
    );
  }

  if (category.trim()) {
    extraWhere += ` AND categories.slug = ?`;
    queryParams.push(category.trim());
  }

  if (preparation_type !== undefined && preparation_type !== "") {
    extraWhere += ` AND COALESCE(products.preparation_type, '') = ?`;
    queryParams.push(preparation_type);
  }

  if (min_price !== undefined && min_price !== "") {
    extraWhere += ` AND COALESCE(products.price, 0) >= ?`;
    queryParams.push(Number(min_price));
  }

  if (max_price !== undefined && max_price !== "") {
    extraWhere += ` AND COALESCE(products.price, 0) <= ?`;
    queryParams.push(Number(max_price));
  }

  if (min_calories !== undefined && min_calories !== "") {
    extraWhere += ` AND COALESCE(products.calories, 0) >= ?`;
    queryParams.push(Number(min_calories));
  }

  if (max_calories !== undefined && max_calories !== "") {
    extraWhere += ` AND COALESCE(products.calories, 0) <= ?`;
    queryParams.push(Number(max_calories));
  }

  if (min_weight_grams !== undefined && min_weight_grams !== "") {
    extraWhere += ` AND COALESCE(products.weight_grams, 0) >= ?`;
    queryParams.push(Number(min_weight_grams));
  }

  if (max_weight_grams !== undefined && max_weight_grams !== "") {
    extraWhere += ` AND COALESCE(products.weight_grams, 0) <= ?`;
    queryParams.push(Number(max_weight_grams));
  }

  if (min_servings !== undefined && min_servings !== "") {
    extraWhere += ` AND COALESCE(products.servings, 0) >= ?`;
    queryParams.push(Number(min_servings));
  }

  if (max_servings !== undefined && max_servings !== "") {
    extraWhere += ` AND COALESCE(products.servings, 0) <= ?`;
    queryParams.push(Number(max_servings));
  }

  if (min_storage_life_months !== undefined && min_storage_life_months !== "") {
    extraWhere += ` AND COALESCE(products.storage_life_months, 0) >= ?`;
    queryParams.push(Number(min_storage_life_months));
  }

  if (max_storage_life_months !== undefined && max_storage_life_months !== "") {
    extraWhere += ` AND COALESCE(products.storage_life_months, 0) <= ?`;
    queryParams.push(Number(max_storage_life_months));
  }

  if (min_water_needed_ml !== undefined && min_water_needed_ml !== "") {
    extraWhere += ` AND COALESCE(products.water_needed_ml, 0) >= ?`;
    queryParams.push(Number(min_water_needed_ml));
  }

  if (max_water_needed_ml !== undefined && max_water_needed_ml !== "") {
    extraWhere += ` AND COALESCE(products.water_needed_ml, 0) <= ?`;
    queryParams.push(Number(max_water_needed_ml));
  }

  if (min_quantity_available !== undefined && min_quantity_available !== "") {
    extraWhere += ` AND COALESCE(products.quantity_available, 0) >= ?`;
    queryParams.push(Number(min_quantity_available));
  }

  if (max_quantity_available !== undefined && max_quantity_available !== "") {
    extraWhere += ` AND COALESCE(products.quantity_available, 0) <= ?`;
    queryParams.push(Number(max_quantity_available));
  }

  let limitClause = "";
  if (limit !== undefined) {
    const parsedLimit = parseInt(limit, 10);
    if (!Number.isNaN(parsedLimit) && parsedLimit > 0) {
      limitClause = `LIMIT ${parsedLimit}`;
    }
  }

  const productsSQL = buildProductsSQL({
    extraWhere,
    orderBy: `${normalizedSort} ${normalizedOrder}`,
    limitClause,
  });

  connection.query(productsSQL, queryParams, (err, productResult) => {
    if (err) return handleFailedQuery(err, res);

    res.json({
      result: productResult.map((product) => mapPublicProduct(product)),
      filters: {
        search,
        category,
        sort,
        order,
        limit: limit || null,
        preparation_type: preparation_type || null,
        min_price: min_price || null,
        max_price: max_price || null,
        min_calories: min_calories || null,
        max_calories: max_calories || null,
        min_weight_grams: min_weight_grams || null,
        max_weight_grams: max_weight_grams || null,
        min_servings: min_servings || null,
        max_servings: max_servings || null,
        min_storage_life_months: min_storage_life_months || null,
        max_storage_life_months: max_storage_life_months || null,
        min_water_needed_ml: min_water_needed_ml || null,
        max_water_needed_ml: max_water_needed_ml || null,
        min_quantity_available: min_quantity_available || null,
        max_quantity_available: max_quantity_available || null,
      },
    });
  });
}

function show(req, res) {
  const { slug } = req.params;

  const productSQL = buildProductsSQL({
    extraWhere: "AND products.slug = ?",
    orderBy: "products.created_at DESC",
    limitClause: "LIMIT 1",
  });

  connection.query(productSQL, [slug], (err, productResult) => {
    if (err) return handleFailedQuery(err, res);

    const product = productResult[0];
    if (!product) return handleResourceNotFound(res);

    res.json({
      result: mapPublicProduct(product),
    });
  });
}

function availability(req, res) {
  const { items } = req.body;

  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({
      message: "The items field must be a non-empty array",
    });
  }

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

  const stockSQL = `
    SELECT
      slug,
      name,
      quantity_available,
      is_active
    FROM onedaymore.products
    WHERE slug IN (${placeholders});`;

  connection.query(stockSQL, slugs, (err, productResult) => {
    if (err) return handleFailedQuery(err, res);

    const productsMap = new Map(
      productResult.map((product) => [product.slug, product]),
    );

    const result = normalizedItems.map((item) => {
      const product = productsMap.get(item.slug);

      if (!product) {
        return {
          slug: item.slug,
          requested_quantity: item.quantity,
          found: false,
          is_available: false,
          message: "A selected product was not found",
        };
      }

      if (!product.is_active) {
        return {
          slug: product.slug,
          name: product.name,
          requested_quantity: item.quantity,
          quantity_available: product.quantity_available,
          found: true,
          is_available: false,
          message: `Product ${product.name} is not available`,
        };
      }

      return {
        slug: product.slug,
        name: product.name,
        requested_quantity: item.quantity,
        quantity_available: product.quantity_available,
        found: true,
        is_available: product.quantity_available >= item.quantity,
        /* low_availability: product.quantity_available < 10, */
      };
    });

    res.json({ result });
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
  homepage,
  index,
  show,
  availability,
  store,
  update,
  modify,
  destroy,
};

function buildProductsSQL({
  extraWhere = "",
  orderBy = "products.created_at DESC",
  limitClause = "",
}) {
  return `
    SELECT
      categories.name AS category_name,
      categories.slug AS category_slug,
      categories.description AS category_description,

      products.name,
      products.slug,
      products.short_description,
      products.description,
      products.brand,
      products.price,
      products.weight_grams,
      products.servings,
      products.calories,
      products.storage_life_months,
      products.preparation_type,
      products.water_needed_ml,
      products.quantity_available,
      products.image_url,

      COALESCE(SUM(order_product.quantity), 0) AS total_sold,

      CASE
        WHEN latest.slug IS NOT NULL THEN 1
        ELSE 0
      END AS is_latest,

      CASE
        WHEN best.slug IS NOT NULL THEN 1
        ELSE 0
      END AS is_best_seller

    FROM onedaymore.products

    INNER JOIN onedaymore.categories
      ON products.category_id = categories.id

    LEFT JOIN onedaymore.order_product
      ON products.id = order_product.product_id

    LEFT JOIN onedaymore.orders
      ON order_product.order_id = orders.id
      AND orders.status = 'confirmed'

    LEFT JOIN (
      SELECT slug
      FROM onedaymore.products
      WHERE is_active = 1
      ORDER BY created_at DESC
      LIMIT 8
    ) AS latest
      ON products.slug = latest.slug

    LEFT JOIN (
      SELECT p.slug
      FROM onedaymore.products p
      LEFT JOIN onedaymore.order_product op
        ON p.id = op.product_id
      LEFT JOIN onedaymore.orders o
        ON op.order_id = o.id
        AND o.status = 'confirmed'
      WHERE p.is_active = 1
      GROUP BY p.id, p.slug
      ORDER BY COALESCE(SUM(op.quantity), 0) DESC, p.created_at DESC
      LIMIT 8
    ) AS best
      ON products.slug = best.slug

    WHERE products.is_active = 1
    ${extraWhere}

    GROUP BY
      products.id,
      categories.name,
      categories.slug,
      categories.description,
      products.name,
      products.slug,
      products.short_description,
      products.description,
      products.brand,
      products.price,
      products.weight_grams,
      products.servings,
      products.calories,
      products.storage_life_months,
      products.preparation_type,
      products.water_needed_ml,
      products.quantity_available,
      products.image_url,
      latest.slug,
      best.slug

    ORDER BY ${orderBy}
    ${limitClause};
  `;
}

function buildProductImgPath(image_url) {
  if (!image_url) return null;
  return `${process.env.APP_URL}:${process.env.APP_PORT}/img/products/${image_url}`;
}

function mapPublicProduct(product) {
  return {
    category_name: product.category_name,
    category_slug: product.category_slug,
    category_description: product.category_description,
    name: product.name,
    slug: product.slug,
    short_description: product.short_description,
    description: product.description,
    brand: product.brand,
    price: roundCurrency(Number(product.price)),
    weight_grams: product.weight_grams,
    servings: product.servings,
    calories: product.calories,
    storage_life_months: product.storage_life_months,
    preparation_type: product.preparation_type,
    water_needed_ml: product.water_needed_ml,
    quantity_available: product.quantity_available,
    /* low_availability: product.quantity_available < 10, */
    total_sold: Number(product.total_sold),
    is_latest: Boolean(product.is_latest),
    is_best_seller: Boolean(product.is_best_seller),
    image_url: buildProductImgPath(product.image_url),
  };
}

const connection = require("../database/conn");
const {
  handleFailedQuery,
  handleResourceNotFound,
} = require("../utils/database");

function homepage(req, res) {
  const latestArrivalsSQL = `
    SELECT
      products.id,
      products.category_id,
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
      products.is_active,
      products.image_url,
      products.created_at,
      products.updated_at
    FROM onedaymore.products
    INNER JOIN onedaymore.categories
      ON products.category_id = categories.id
    WHERE products.is_active = 1
    ORDER BY products.created_at DESC
    LIMIT 10;`;

  const bestSellersSQL = `
    SELECT
      products.id,
      products.category_id,
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
      products.is_active,
      products.image_url,
      products.created_at,
      products.updated_at,
      COALESCE(SUM(order_product.quantity), 0) AS total_sold
    FROM onedaymore.products
    INNER JOIN onedaymore.categories
      ON products.category_id = categories.id
    LEFT JOIN onedaymore.order_product
      ON products.id = order_product.product_id
    LEFT JOIN onedaymore.orders
      ON order_product.order_id = orders.id
      AND orders.status = 'confirmed'
    WHERE products.is_active = 1
    GROUP BY
      products.id,
      products.category_id,
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
      products.is_active,
      products.image_url,
      products.created_at,
      products.updated_at
    ORDER BY total_sold DESC, products.created_at DESC
    LIMIT 10;`;

  connection.query(latestArrivalsSQL, (latestErr, latestResult) => {
    if (latestErr) return handleFailedQuery(latestErr, res);

    connection.query(bestSellersSQL, (bestErr, bestResult) => {
      if (bestErr) return handleFailedQuery(bestErr, res);

      const latest_arrivals = latestResult.map((product) => ({
        ...product,
        image_url: buildProductImgPath(product.image_url),
      }));

      const best_sellers = bestResult.map((product) => ({
        ...product,
        image_url: buildProductImgPath(product.image_url),
      }));

      res.json({
        result: {
          latest_arrivals,
          best_sellers,
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
  } = req.query;

  const allowedSortFields = {
    name: "products.name",
    price: "products.price",
    created_at: "products.created_at",
  };

  const normalizedSort =
    allowedSortFields[sort] || allowedSortFields.created_at;

  const normalizedOrder =
    String(order).toLowerCase() === "asc" ? "ASC" : "DESC";

  const queryParams = [];
  let whereClause = "WHERE products.is_active = 1";

  if (search.trim()) {
    whereClause += `
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
    whereClause += ` AND categories.slug = ?`;
    queryParams.push(category.trim());
  }

  let limitClause = "";
  if (limit !== undefined) {
    const parsedLimit = parseInt(limit, 10);
    if (!Number.isNaN(parsedLimit) && parsedLimit > 0) {
      limitClause = ` LIMIT ${parsedLimit}`;
    }
  }

  const productsSQL = `
    SELECT
      products.id,
      products.category_id,
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
      products.is_active,
      products.image_url,
      products.created_at,
      products.updated_at
    FROM onedaymore.products
    INNER JOIN onedaymore.categories
      ON products.category_id = categories.id
    ${whereClause}
    ORDER BY ${normalizedSort} ${normalizedOrder}
    ${limitClause};`;

  connection.query(productsSQL, queryParams, (err, productResult) => {
    if (err) return handleFailedQuery(err, res);

    const products = productResult.map((product) => ({
      ...product,
      image_url: buildProductImgPath(product.image_url),
    }));

    res.json({
      result: products,
      filters: {
        search,
        category,
        sort,
        order,
        limit: limit || null,
      },
    });
  });
}

function show(req, res) {
  const { slug } = req.params;

  const productsSQL = `
    SELECT
      products.id,
      products.category_id,
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
      products.is_active,
      products.image_url,
      products.created_at,
      products.updated_at
    FROM onedaymore.products
    INNER JOIN onedaymore.categories
      ON products.category_id = categories.id
    WHERE products.slug = ?
      AND products.is_active = 1;`;

  connection.query(productsSQL, [slug], (err, productResult) => {
    if (err) return handleFailedQuery(err, res);

    const product = productResult[0];
    if (!product) return handleResourceNotFound(res);

    product.image_url = buildProductImgPath(product.image_url);

    res.json({ result: product });
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
      id: Number(item.id),
      quantity: Number(item.quantity),
    }))
    .filter(
      (item) =>
        Number.isInteger(item.id) &&
        item.id > 0 &&
        Number.isInteger(item.quantity) &&
        item.quantity > 0,
    );

  if (normalizedItems.length !== items.length) {
    return res.status(400).json({
      message: "Each item must contain a valid id and quantity greater than 0",
    });
  }

  const productIds = [...new Set(normalizedItems.map((item) => item.id))];
  const placeholders = productIds.map(() => "?").join(",");

  const stockSQL = `
    SELECT
      id,
      slug,
      name,
      quantity_available,
      is_active
    FROM onedaymore.products
    WHERE id IN (${placeholders});`;

  connection.query(stockSQL, productIds, (err, productResult) => {
    if (err) return handleFailedQuery(err, res);

    const productsMap = new Map(
      productResult.map((product) => [product.id, product]),
    );

    const result = normalizedItems.map((item) => {
      const product = productsMap.get(item.id);

      if (!product) {
        return {
          id: item.id,
          requested_quantity: item.quantity,
          found: false,
          is_available: false,
          message: "Product not found",
        };
      }

      if (!product.is_active) {
        return {
          id: product.id,
          slug: product.slug,
          name: product.name,
          requested_quantity: item.quantity,
          quantity_available: product.quantity_available,
          found: true,
          is_available: false,
          message: "Product is not available",
        };
      }

      return {
        id: product.id,
        slug: product.slug,
        name: product.name,
        requested_quantity: item.quantity,
        quantity_available: product.quantity_available,
        found: true,
        is_available: product.quantity_available >= item.quantity,
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

function buildProductImgPath(image_url) {
  if (!image_url) return null;
  return `${process.env.APP_URL}:${process.env.APP_PORT}/img/products/${image_url}`;
}

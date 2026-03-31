const connection = require("../database/conn");
const {
  handleFailedQuery,
  handleResourceNotFound,
} = require("../utils/database");

function index(req, res) {
  const productsSQL = `
    SELECT *
    FROM onedaymore.products;`;
  connection.query(productsSQL, (err, productResult) => {
    if (err) return handleFailedQuery(err, res);
    const products = productResult.map((product) => ({
      ...product,
      image_url: buildProductImgPath(product.image_url),
    }));
    res.json({ result: products });
  });
}

function show(req, res) {
  const { slug } = req.params;
  const productsSQL = `
    SELECT products.*   
    FROM onedaymore.products
    WHERE products.slug = ?`;
  connection.query(productsSQL, [slug], (err, productResult) => {
    if (err) return handleFailedQuery(err, res);
    const product = productResult[0];
    if (!product) return handleResourceNotFound(res);
    product.image_url = buildProductImgPath(product.image_url);

    res.json({ result: product });
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

module.exports = { index, show, store, update, modify, destroy };

function buildProductImgPath(image_url) {
  return `${process.env.APP_URL}:${process.env.APP_PORT}/img/products/${image_url}`;
}

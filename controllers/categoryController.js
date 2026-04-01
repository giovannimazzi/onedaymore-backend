const connection = require("../database/conn");
const {
  handleFailedQuery,
  handleResourceNotFound,
} = require("../utils/database");

function index(req, res) {
  const categoriesSQL = `
    SELECT
      id,
      name,
      slug,
      description,
      created_at,
      updated_at
    FROM onedaymore.categories
    ORDER BY name ASC;`;

  connection.query(categoriesSQL, (err, result) => {
    if (err) return handleFailedQuery(err, res);

    res.json({
      result,
    });
  });
}

function show(req, res) {
  const { slug } = req.params;

  const categorySQL = `
    SELECT
      id,
      name,
      slug,
      description,
      created_at,
      updated_at
    FROM onedaymore.categories
    WHERE slug = ?;`;

  connection.query(categorySQL, [slug], (err, result) => {
    if (err) return handleFailedQuery(err, res);

    const category = result[0];

    if (!category) return handleResourceNotFound(res);

    res.json({
      result: category,
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
  store,
  update,
  modify,
  destroy,
};

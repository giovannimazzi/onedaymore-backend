const connection = require("../database/conn");
const {
  handleFailedQuery,
  handleResourceNotFound,
} = require("../utils/database");

function index(req, res) {
  const categoriesSQL = `
    SELECT
      name,
      slug,
      description
    FROM onedaymore.categories
    ORDER BY name ASC;`;

  connection.query(categoriesSQL, (err, result) => {
    if (err) return handleFailedQuery(err, res);

    const categories = result.map((category) => mapPublicCategory(category));

    res.json({
      result: categories,
    });
  });
}

function show(req, res) {
  const { slug } = req.params;

  const categorySQL = `
    SELECT
      name,
      slug,
      description
    FROM onedaymore.categories
    WHERE slug = ?;`;

  connection.query(categorySQL, [slug], (err, result) => {
    if (err) return handleFailedQuery(err, res);

    const category = result[0];
    if (!category) return handleResourceNotFound(res);

    res.json({
      result: mapPublicCategory(category),
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

function mapPublicCategory(category) {
  return {
    name: category.name,
    slug: category.slug,
    description: category.description,
  };
}

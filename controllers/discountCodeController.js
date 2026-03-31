const connection = require("../database/conn");
const {
  handleFailedQuery,
  handleResourceNotFound,
} = require("../utils/database");

function index(req, res) {
  const discountCodesSQL = `
    SELECT *
    FROM onedaymore.discount_codes;`;
  connection.query(discountCodesSQL, (err, discountCodeResult) => {
    if (err) return handleFailedQuery(err, res);
    res.json({ result: discountCodeResult });
  });
}

function show(req, res) {
  const { id } = req.params;
  const discountCodesSQL = `
    SELECT discount_codes.*   
    FROM onedaymore.discount_codes
    WHERE discount_codes.id = ?`;
  connection.query(discountCodesSQL, [id], (err, discountCodeResult) => {
    if (err) return handleFailedQuery(err, res);
    const discountCode = discountCodeResult[0];
    if (!discountCode) return handleResourceNotFound(res);

    res.json({ result: discountCode });
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

//prevedere validazione dati in ingresso

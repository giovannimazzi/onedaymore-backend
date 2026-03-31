const mysql2 = require("mysql2");

const connection = mysql2.createConnection({
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || 3306),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME,
});

connection.connect((err) => {
  if (err) throw err;
  console.log(`Connected to MySQL!`);
});

module.exports = connection;

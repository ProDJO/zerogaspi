const { Pool } = require("pg");

const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "ZeroGaspi",
  password: "yasyou7",
  port: 5432,
});

module.exports = pool;
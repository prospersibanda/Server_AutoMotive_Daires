const mysql = require("mysql2/promise");

// Create a connection pool to the database
const pool = mysql.createPool({
  host: "localhost", // Replace with your MySQL host
  user: "root", // Replace with your MySQL username
  password: "Prosper21!", // Replace with your MySQL password
  database: "Automotive", // Replace with your database name
});

module.exports = pool;

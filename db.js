const express = require("express");
const router = express.Router();
const mysql = require("mysql");
const dotenv = require("dotenv").config();

const {
  Dhost,
  Dport,
  Duser,
  Dpassword,
  Ddatabase,
  Thost,
  Tport,
  Tuser,
  Tpassword,
  Tdatabase,
} = process.env;

// ========== TESTING ========= //
const db = mysql.createConnection({
  host: Thost,
  port: 3306,
  user: Tuser,
  password: Tpassword,
  database: Tdatabase,
  multipleStatements: true,
});

// ========== SERVER ========= //
// const db = mysql.createConnection({
//   host: Dhost,
//   port: 3306,
//   user: Duser,
//   password: Dpassword,
//   database: Ddatabase,
// });

db.connect((error) => {
  if (error) {
    console.error("Error connecting to MySQL:", error);
  } else {
    console.log("Connected with database!");
  }
});

module.exports = db;

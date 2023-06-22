const express = require("express");
const router = express.Router();
const mysql = require("mysql");
const dotenv = require("dotenv").config();

const {
  host,
  port,
  user,
  password,
  database
} = process.env;


// ========== SERVER ========= //
const db = mysql.createConnection({
  host: host,
  port: 3306,
  user:user,
  password: password,
  database: database,
  multipleStatements: true
});

db.connect((error) => {
  if (error) {
    console.error("Error connecting to MySQL:", error);
  } else {
    console.log("Connected with database!");
  }
});

module.exports = db;

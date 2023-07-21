const express = require("express");
const router = express.Router();
const mysql = require("mysql");
const dotenv = require("dotenv").config();

const {
  host, user, password, database,
  hostB, userB, passwordB, databaseB
} = process.env;


// ========== FIRST DATABASE CONNECTION ========= //
const db = mysql.createConnection({
  host: host,
  port: 3306,
  user: user,
  password: password,
  database: database,
  multipleStatements: true
});

db.connect((error) => {
  if (error) {
    console.error("Error connecting to database", error);
  } else {
    console.log("Connected with database!");
  }
});

// ========== SECOND DATABASE CONNECTION ========= //
const dbB = mysql.createConnection({
  host: hostB,
  port: 3306,
  user: userB,
  password: passwordB,
  database: databaseB,
  multipleStatements: true
});

dbB.connect((error) => {
  if (error) {
    console.error("Error connecting to database B", error);
  } else {
    console.log("Connected with database B!");
  }
});

module.exports = { db, dbB };

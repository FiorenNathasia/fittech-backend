const express = require("express");
const router = express.Router();
const mysql = require("mysql");
const dotenv = require("dotenv");
const path = require("path");

dotenv.config({ path: "./.env" });

const db = mysql.createConnection({
  host: process.env.DATABASE_HOST,
  user: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE,
});

db.connect((error) => {
  if (error) {
    console.log(error);
  } else {
    console.log("MYSQL connected...");
  }
});

router.post("/signup", (req, res) => {
  const sql = "INSERT INTO users (`name`, `email`, `password`) VALUES (?)";
  const values = [req.body.name, req.body.email, req.body.password];
  db.query(sql, [values], (error, data) => {
    if (error) {
      return res.status(500).json({ error: "Error inserting data" });
    }
    return res.status(200).json(data);
  });
});

router.post("/login", (req, res) => {
  const sql = "SELECT * FROM users WHERE `email`= ? AND `password` = ?";
  db.query(sql, [req.body.email, req.body.password], (error, data) => {
    if (error) {
      return res.status(500).json({ error: "Error inserting data" });
    }
    if (data.length > 0) {
      return res.json("Success");
    } else {
      return res.json("Fail");
    }
  });
});

router.get("/", (req, res) => {
  const publicDirectory = path.join(__dirname, "../public");
  res.sendFile(path.join(publicDirectory, "index.html"));
});

module.exports = router;

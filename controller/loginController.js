require("dotenv").config();
const db = require("../utils/db");
const jwt = require("jsonwebtoken");
const { generateAccessToken } = require("../utils/token");

const login = (req, res) => {
  const { email, password } = req.body;

  const sql = "SELECT * FROM users WHERE `email`= ? AND `password` = ?";

  db.query(sql, [email, password], (error, data) => {
    if (error) {
      console.error("Error retrieving data:", error);
      return res.status(500).json({ error: "Error retrieving data" });
    }
    if (data.length > 0) {
      const user = data[0];
      const accessToken = generateAccessToken(user);
      res.json({
        id: user.id,
        email: user.email,
        isAdmin: user.isAdmin,
        accessToken,
      });
    } else {
      return res.status(400).json("Email or password incorrect!");
    }
  });
};

module.exports = { login };

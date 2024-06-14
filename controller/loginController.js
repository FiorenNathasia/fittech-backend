require("dotenv").config();
const db = require("../utils/db");
const jwt = require("jsonwebtoken");

let refreshTokens = [];

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
      const accessToken = jwt.sign(
        {
          id: user.id,
          isAdmin: user.isAdmin,
        },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: "20min" }
      );

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

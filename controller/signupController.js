const db = require("../utils/db");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

const signup = (req, res) => {
  const { name, email, password, confirmPassword } = req.body;
  if (password !== confirmPassword) {
    return res.status(400).json({ error: "Passwords do not match" });
  }

  const checkEmailQuery = "SELECT * FROM users WHERE email = ?";
  db.query(checkEmailQuery, [email], async (error, results) => {
    if (error) {
      return res.status(500).json({ error: "Error checking email" });
    }

    if (results.length > 0) {
      return res.status(400).json({ error: "Email already in use" });
    }

    let hashedPassword;
    hashedPassword = await bcrypt.hash(req.body.password, 8);
    console.log("Hashed Pasword:", hashedPassword);

    const sql = "INSERT INTO users (`name`, `email`, `password`) VALUES (?)";
    const values = [req.body.name, email, hashedPassword];
    db.query(sql, [values], (error, data) => {
      if (error) {
        return res.status(500).json({ error: "Error inserting data" });
      }
      return res.status(200).json(data);
    });
  });
};

module.exports = { signup };

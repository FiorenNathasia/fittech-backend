const db = require("../utils/db");

const signup = (req, res) => {
  const email = req.body.email;

  const checkEmailQuery = "SELECT * FROM users WHERE email = ?";
  db.query(checkEmailQuery, [email], (error, results) => {
    if (error) {
      return res.status(500).json({ error: "Error checking email" });
    }

    if (results.length > 0) {
      return res.status(400).json({ error: "Email already in use" });
    }

    // If email doesn't exist, proceed with signup
    const sql = "INSERT INTO users (`name`, `email`, `password`) VALUES (?)";
    const values = [req.body.name, email, req.body.password];
    db.query(sql, [values], (error, data) => {
      if (error) {
        return res.status(500).json({ error: "Error inserting data" });
      }
      return res.status(200).json(data);
    });
  });
};

module.exports = { signup };

const db = require("../utils/db");

const login = (req, res) => {
  const sql = "SELECT * FROM users WHERE `email`= ? AND `password` = ?";
  db.query(sql, [req.body.email, req.body.password], (error, data) => {
    if (error) {
      return res.status(500).json({ error: "Error retrieving data" });
    }
    if (data.length > 0) {
      return res.json("Success");
    } else {
      return res.json("Fail");
    }
  });
};

module.exports = { login };

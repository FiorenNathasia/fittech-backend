const db = require("../utils/db");

const logout = (req, res) => {
  const token = req.headers.authorization.split(" ")[1];

  db.query(
    "INSERT INTO token_blacklist (token) VALUES (?)",
    [token],
    (err, results) => {
      if (err) {
        console.error("Error inserting token into blacklist:", err);
        return res
          .status(500)
          .json({ error: "Error inserting token into blacklist" });
      }
      res.json({ message: "Logout successful" });
    }
  );
};

module.exports = { logout };

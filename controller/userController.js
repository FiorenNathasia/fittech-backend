require("dotenv").config();
const db = require("../utils/db");

const getUser = (req, res) => {
  const { id } = req.params;

  const sql = "SELECT * FROM users WHERE `id` = ?";

  db.query(sql, [id], (error, data) => {
    if (error) {
      console.error("Error retrieving data:", error);
      return res.status(500).json({ error: "Error retrieving data" });
    }
    if (data.length > 0) {
      const user = data[0];
      res.json({
        id: user.id,
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin,
      });
    } else {
      return res.status(404).json({ error: "User not found" });
    }
  });
};

module.exports = { getUser };

require("dotenv").config();
const db = require("../utils/db");
const jwt = require("jsonwebtoken");

// const login = (req, res) => {
//   const sql = "SELECT * FROM users WHERE `email`= ? AND `password` = ?";
//   db.query(sql, [req.body.email, req.body.password], (error, data) => {
//     if (error) {
//       return res.status(500).json({ error: "Error retrieving data" });
//     }
//     if (data.length > 0) {
//       return res.json("Success");
//     } else {
//       return res.json("Fail");
//     }
//   });
// };
const login = (req, res) => {
  const { email, password } = req.body;

  const sql = "SELECT * FROM users WHERE `email`= ? AND `password` = ?";

  db.query(sql, [email, password], (error, data) => {
    if (error) {
      console.error("Error retrieving data:", error); // Log the error for debugging
      return res.status(500).json({ error: "Error retrieving data" });
    }
    if (data.length > 0) {
      const user = data[0];
      // Assuming user data is returned from the database, you can return the user object
      const accessToken = jwt.sign(
        {
          id: user.id,
          isAdmin: user.isAdmin,
        },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: "15min" }
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

const jwt = require("jsonwebtoken");
const db = require("../utils/db");

const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (authHeader) {
    const token = authHeader.split(" ")[1];

    db.query(
      "SELECT * FROM token_blacklist WHERE token = ?",
      [token],
      (err, results) => {
        if (err) {
          console.error("Error checking token blacklist:", err);
          return res
            .status(500)
            .json({ error: "Error checking token blacklist" });
        }
        if (results.length > 0) {
          return res
            .status(401)
            .json({ error: "Token has been revoked. Please login again." });
        } else {
          jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
            if (err) {
              return res.status(403).json({ error: "Token is not valid" });
            }
            req.user = user;
            next();
          });
        }
      }
    );
  } else {
    res.status(401).json({ error: "You are not authenticated" });
  }
};

module.exports = verifyToken;

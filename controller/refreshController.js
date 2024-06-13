const db = require("../utils/db");
const jwt = require("jsonwebtoken");

let refreshTokens = [];

const refresh = (req, res) => {
  const refreshToken = req.body.token;
  if (!refreshToken) return res.status(401).json("You are not authenticated");
};

module.exports = { refresh };

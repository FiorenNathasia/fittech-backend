const db = require("../utils/db");

const deleteUser = (req, res) => {
  const userId = req.params.userId;

  if (req.user.id === userId || req.user.isAdmin) {
    const sql = "DELETE FROM users WHERE id = ?";
    db.query(sql, [userId], (error, result) => {
      if (error) {
        return res.status(500).json({ error: "Error deleting user" });
      }
      if (result.affectedRows > 0) {
        res.status(200).json("User has been deleted.");
      } else {
        res.status(404).json("User not found.");
      }
    });
  } else {
    res.status(403).json("You are not allowed to delete this user!");
  }
};

module.exports = { deleteUser };

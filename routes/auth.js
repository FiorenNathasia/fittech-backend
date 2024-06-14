const express = require("express");
const signupController = require("../controller/signupController");
const logoutController = require("../controller/logoutController");
const loginController = require("../controller/loginController");
const deleteController = require("../controller/deleteController");
const verifyToken = require("../middleware/verifyToken");

const router = express.Router();

router.post("/signup", signupController.signup);
router.post("/login", loginController.login);
router.post("/logout", verifyToken, logoutController.logout);
router.delete("/users/:userId", verifyToken, deleteController.deleteUser);

module.exports = router;

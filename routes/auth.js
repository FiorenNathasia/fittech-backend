const express = require("express");
const signupController = require("../controller/signupController");
const loginController = require("../controller/loginController");

const router = express.Router();

router.post("/signup", signupController.signup);
router.post("/login", loginController.login);

module.exports = router;

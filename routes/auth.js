const express = require("express");
const signupController = require("../controller/signupController");
const loginController = require("../controller/loginController");
const deleteController = require("../controller/deleteController");
const refreshController = require("../controller/refreshController");
const verifyToken = require("../middleware/verifyToken");

const router = express.Router();

router.post("/signup", signupController.signup);
router.post("/refresh", refreshController.refresh);
router.post("/login", loginController.login);
router.delete("/users/:userId", verifyToken, deleteController.deleteUser);

module.exports = router;

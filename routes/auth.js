const express = require("express");
const signupController = require("../controller/signupController");
const loginController = require("../controller/loginController");

const router = express.Router();

router.post("/signup", signupController.signup);
router.post("/login", loginController.login);

// router.get("/", (req, res) => {
//   const publicDirectory = path.join(__dirname, "../public");
//   res.sendFile(path.join(publicDirectory, "index.html"));
// });

module.exports = router;

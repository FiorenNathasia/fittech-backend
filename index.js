require("dotenv").config();
const express = require("express");
const cors = require("cors");
const axios = require("axios");
const app = express();
const authRouter = require("./routes/auth");
const userRouter = require("./routes/user");
const workoutsRouter = require("./routes/workouts");
const verify = require("./middleware/verify");

app.use(express.json());
app.use(cors());

app.use("/api/auth", authRouter);

app.use(verify);

app.use("/api/user", userRouter);
app.use("/api/workouts", workoutsRouter);

app.listen(8080, () => {
  console.log("server listening on 8080");
});

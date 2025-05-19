require("dotenv").config();
const express = require("express");
const cors = require("cors");
const app = express();
const authRouter = require("./routes/auth");
const userRouter = require("./routes/user");
const workoutsRouter = require("./routes/workouts");
const verify = require("./middleware/verify");

app.use(express.json());
app.use(cors());

app.get("/", (_, res) => {
  res.send("Hello world");
});

app.use("/api/auth", authRouter);

app.use(verify);

app.use("/api/user", userRouter);
app.use("/api/workouts", workoutsRouter);

const port = process.env.PORT || 3030;

app.listen(port, () => {
  console.log(`server listening on ${port}`);
});

const express = require("express");
// const router = require("./routes/auth");
const db = require("./db/db");

const app = express();
app.use(express.json());
// app.use(router);

app.get("/login", async (req, res) => {
  const userEmail = req.query.email;
  const userPassword = req.query.password;

  const result = await db("users")
    .where("email", userEmail)
    .andWhere("password", userPassword);

  console.log(result);
  res.status(200).send({ mesage: "hello" });
});

app.listen(8080, () => {
  console.log("server listening on 8080");
});

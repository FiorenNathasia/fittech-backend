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
    .andWhere("password", userPassword)
    .first();

  // if we found someone result = [{id:1, first_name ...}]
  // if we cant find someone result = []

  // if we put .first() at the end, then we always get the first one in the list

  // if we found someone result = {id: 1, first_name ...}
  // if we cant find someone result = undefined

  // so therefore, when we use .first - result is no longer a list
  // so doing result.length - doesn\t make any sense, you cant do .length on
  // something that isn't a list

  console.log(result);

  if (result) {
    res.status(200).send({
      data: {
        firstName: result.first_name,
        lastName: result.last_name,
        email: result.email,
      },
    });
  } else {
    res.status(403).send({ message: "You're unauthorized" });
  }
});

app.listen(8080, () => {
  console.log("server listening on 8080");
});

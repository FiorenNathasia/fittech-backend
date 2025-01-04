const express = require("express");
const db = require("./db/db");
const app = express();
const jwt = require("jsonwebtoken");
app.use(express.json());

//JWT for  POST login  API

//POST (to log in user)
app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  const user = await db("users")
    .where("email", email)
    .andWhere("password", password)
    .first();

  if (user) {
    //Generate an access token
    const accessToken = jwt.sign(
      // a method in the library used to creat a JSON Web Token
      { id: user.id, email: user.id }, //Payload: contains known info about the user to verify who the user is
      "mysecretKey", // Secret  Key: a  private key to generate a digital  signture  to proof authencity of token
      { expiresIn: "24h" } //option that shows how long the token  is  used for
    );
    res.status(200).send({
      data: {
        firstName: user.first_name,
        lastName: user.last_name,
        email: user.email,
        accessToken,
      },
    });
  } else {
    res.status(403).send({ message: "You're unauthorized" });
  }
});

//POST (creating data for new user)
app.post("/signup", async (req, res) => {
  const email = req.body.email;
  //insert first name, last name, email, andd password to the database as a new entry
  //Step 1: if someone makes a post request, how do you get the data
  // console.log("POST parameter received are: ", req.body);
  //Step 2: a. Check if the email already exist in the database
  const user = await db("users").where("email", email).first();

  //  b. return messsage user already exist (400 (bad request))
  if (user) {
    res.status(400).send({ message: "User already exists" });
  } else {
    //Step 4: Figure how to insert the data into a database
    //  a. if the action was succesfull, return 200 (succesfull)
    const newUser = await db("users")
      .insert({
        first_name: req.body.firstName,
        last_name: req.body.lastName,
        email: req.body.email,
        password: req.body.password,
      })
      .returning("*");
    console.log(newUser);
    res.status(200).send({
      data: {
        firstName: newUser[0].first_name,
        lastName: newUser[0].last_name,
        email: newUser[0].email,
      },
    });
  }
  //  b. if not do a catch
  // Step 5: After successful, return their info (rerturn email, first name, last name)
});

const verify = (req, res, next) => {
  const headers = req.headers;
  console.log(headers); //  {Authorization: "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiZW1haWwiOjEsImlhdCI6MTczNTY2NTk2OH0.r3Zk7aKayHAmOkR3E5ZxyAN3CaMu880GaWBi94rOyDU", Fioren: "123"}

  const authHeader = req.headers.Authorization;
  console.log(authHeader); // Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiZW1haWwiOjEsImlhdCI6MTczNTY2NTk2OH0.r3Zk7aKayHAmOkR3E5ZxyAN3CaMu880GaWBi94rOyDU
  if (authHeader) {
    const token = authHeader.split(" ")[1];
    jwt.verify(token, "mysecretKey", (err, user) => {
      if (err) {
        return res.status(403).json("Token is not valid!");
      }
      req.user = user;
      next();
    });
  } else {
    res.status(401).send({ message: "You  are not authenticated!" });
  }
};

app.listen(8080, () => {
  console.log("server listening on 8080");
});

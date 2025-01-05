const express = require("express");
const db = require("./db/db");
const app = express();
const jwt = require("jsonwebtoken");
app.use(express.json());

//Make independent functions to make both access and refresh token
//This will  make the access and refresh  token has a single responsibility
//This improves code readability and makes the codebase easier to maintainand reusable in the rest of the code

//Purpose: Defines the function and specifies its input parameter (user), it represents the user object containing details like id and email, which are required for token payload generation.
const generateAccessToken = (user) => {
  return jwt.sign(
    // a method in the library used to creat a JSON Web Token
    { id: user.id, email: user.email }, //Payload: contains known info about the user to verify who the user is
    "mysecretKey", // Secret  Key: a  private key to generate a digital  signture  to proof authencity of token
    { expiresIn: "24h" } //option that shows how long the token  is  used for
  );
};

//POST (to log in user)
app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  const user = await db("users")
    .where("email", email)
    .andWhere("password", password)
    .first();

  if (user) {
    //Generate an access token
    //The generateAccessToken function is called with the user object.
    //It takes the  result from  the database access above and use the result in place of the use parameter of the called function
    //It assigns  the result to a new variables accessToken and refreshToken
    const accessToken = generateAccessToken(user);
    res.status(200).send({
      data: {
        firstName: user.first_name,
        lastName: user.last_name,
        email: user.email,
        //if both the key and value is the same, you can write it out as one
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
    const accessToken = generateAccessToken(newUser[0]);
    res.status(200).send({
      data: {
        firstName: newUser[0].first_name,
        lastName: newUser[0].last_name,
        email: newUser[0].email,
        accessToken,
      },
    });
  }
  //  b. if not do a catch
  // Step 5: After successful, return their info (rerturn email, first name, last name)
});

app.use(verify);

//To  test the middleware is working
app.get("/test", (req, res) => {
  if (res.locals.userId) {
    return res.status(200).send({ id: res.locals.userId });
  }
});

function verify(req, res, next) {
  const authHeader = req.headers.authorization;
  console.log("this is the middlewares");
  if (!authHeader) {
    return res.status(400).send({ message: "There is no token!" });
  }
  try {
    const token = authHeader.split(" ")[1];
    res.locals.userId = jwt.verify(token, "mysecretKey").id;
    next();
  } catch (error) {
    return res.status(403).send({ message: "Token is invalid!" });
  }
}

app.listen(8080, () => {
  console.log("server listening on 8080");
});

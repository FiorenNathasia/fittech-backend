const express = require("express");
const db = require("./db/db");
const app = express();
const jwt = require("jsonwebtoken");
app.use(express.json());

// //POST (refresh token)
// //1 a.This acts ass a simple in memory way to store refresh tokens, as there is no initial refresh token yet it is an empty array,
// //when they are made it will be .pushed() here
// //b.After logout process, this token willl be  deletedorifyou have access token stolen you can just logout and delete all refresh token not allowing access
// let refreshTokens = [];

// app.post("/refresh", (req, res) => {
//   //take the refresh token from user
//   const refreshToken = req.body.token;
//   //send error if there's no token or it's invalid
//   if (!refreshToken)
//     return res.status(401).send({ message: "You are not authenticated!" });
//   // This is saying if refreshTokens array does not include this token
//   if (!refreshTokens.includes(refreshToken)) {
//     return res.status(403).send({ message: "Refresh token is not valid!" });
//   }
//   //It accesss the jwt library and using the .verify() method will take the refresh  token and see if it has the needed correct payload and secret key used to make the token
//   jwt.verify(refreshToken, "myRefreshSecretKey", (err, user) => {
//     //if  there is an error, just console log the error
//     err.console.log(err);
//     //if everything is ok
//     //1a. We are going to  invalidate this token (delete in refreshTokens array)
//     //.filter() will take every  token
//     //and if this token -> (token) => token
//     //is not our refreshToken -> token !== refreshToken they will stay
//     //if it equals it's going to delete it from this array
//     refreshTokens = refreshTokens.filter((token) => token !== refreshToken);
//     //Create new acess token
//     const newAccessToken = generateAccessToken(user); //->come inside of our refreshToken (our payload)
//     //Make new refresh token after
//     //You don't have to make new refreshToken, but it will make a more secure app
//     const newRefreshToken = generateRefreshToken(user);
//     //Now you can push  your  new refreshToken in the refreshTokens array
//     refreshTokens.push(newRefreshToken);
//     //Finally send response
//     res.status(200).send({
//       acessToken: newAccessToken,
//       refreshToken: newRefreshToken,
//     });
//   });
// });

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
// const generateRefreshToken = (user) => {
//   return jwt.sign(
//     // a method in the library used to creat a JSON Web Token
//     { id: user.id, email: user.email }, //Payload: contains known info about the user to verify who the user is
//     "myRefreshSecretKey", // Secret  Key: a  private key to generate a digital  signture  to proof authencity of token
//     { expiresIn: "24h" } //option that shows how long the token  is  used for
//   );
// };

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
    // //You need to make refresh token after access token
    // const refreshToken = generateRefreshToken(user);
    // //When the  refresh token has been generated,you push it  to the refreshTokens array we have set above
    // refreshTokens.push(refreshToken);
    res.status(200).send({
      data: {
        firstName: user.first_name,
        lastName: user.last_name,
        email: user.email,
        //if both the key and value is the same, you can write it out as one
        accessToken,
        // refreshToken,
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

const verify = (req, res, next) => {
  const headers = req.headers;
  console.log(headers); //  {Authorization: "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiZW1haWwiOjEsImlhdCI6MTczNTY2NTk2OH0.r3Zk7aKayHAmOkR3E5ZxyAN3CaMu880GaWBi94rOyDU", Fioren: "123"}

  const authHeader = req.headers.Authorization;
  console.log(authHeader); // Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiZW1haWwiOjEsImlhdCI6MTczNTY2NTk2OH0.r3Zk7aKayHAmOkR3E5ZxyAN3CaMu880GaWBi94rOyDU
  if (authHeader) {
    //takes the result of const authHeader and split the token from the brearer ass seen above and selects it based on  it's position in the array ->[1]
    const token = authHeader.split(" ")[1];
    //access  the jwt library and use the method verify to take the token from previous line and checks the pay load  with the info  off the user and the secret key  used to make it
    jwt.verify(token, "mysecretKey", (err, user) => {
      if (err) {
        return res.status(403).send({ message: "Token is not valid!" });
      }
      //if the user from the request is the same as the user found in the  verified token
      req.user = user;
      //then in  can continue next to the code afer the verify
      next();
    });
  } else {
    res.status(401).send({ message: "You  are not authenticated!" });
  }
};
app.post("/api/logout", verify, (req, res) => {
  // The `verify` middleware ensures that the user is authenticated by checking the token
  // At this point, the user is authenticated, and the token is valid

  res.status(200).send({ message: "You are logged out!" });
});

app.listen(8080, () => {
  console.log("server listening on 8080");
});

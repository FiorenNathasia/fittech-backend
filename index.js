const express = require("express");
const cors = require("cors");
const axios = require("axios");
const db = require("./db/db");
const app = express();
const jwt = require("jsonwebtoken");
const { YoutubeTranscript } = require("youtube-transcript");
const ytdl = require("@distube/ytdl-core");
app.use(express.json());
app.use(cors());
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
  const userId = res.locals.userId;
  return res.status(200).send({ id: userId });
});

function verify(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(400).send({ message: "There is no token!" });
  }
  try {
    const token = authHeader.split(" ")[1];
    const userId = jwt.verify(token, "mysecretKey").id;

    res.locals.userId = userId;
    next();
  } catch (error) {
    return res.status(403).send({ message: "Token is invalid!" });
  }
}

//GET (info of the logged in user)
app.get("/user", async (req, res) => {
  const userId = res.locals.userId;

  try {
    const userInfo = await db("users").where({ id: userId }).first();
    console.log(userInfo);
    res.status(200).send({
      data: {
        firstName: userInfo.first_name,
        lastName: userInfo.last_name,
        email: userInfo.email,
      },
    });
  } catch (error) {
    res.status(400).send({ message: "Error retrieving user Information" });
  }
});

//POST (receiving data, a single variable called video url)
app.post("/savetest", async (req, res) => {
  const userUrl = req.body.userUrl;
  try {
    const response = await axios.get(userUrl);
    console.log(response);
    res.status(200).send({ data: response.data });
    return response;
  } catch {
    res.status(400).send({ message: "Error making request" });
  }
});
//OpenAi Function
async function chatgpt(transcript) {
  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${openAiKey}`,
  };
  try {
    const response = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      {
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "user",
            content: `You are a workout assistant, here is a transcript from a workout video "${transcript}", condense it down into a list of key steps and return the steps in the following json format e.g. ["10 push ups", "3 squats"] - return only json, do not include any explainer text or markdown formatting`,
          },
        ],
      },
      { headers }
    );
    const reply = response.data.choices[0].message.content;
    return reply;
  } catch (error) {
    return false;
  }
}

function convertToJson(string) {
  try {
    return JSON.parse(string);
  } catch (error) {
    return false;
  }
}
//POST (save video from url and transcribes it)
app.post("/save", async (req, res) => {
  const videoUrl = req.body.videoUrl;

  if (!videoUrl) {
    return res.status(400).send({ message: "Invalid YouTube URL" });
  }

  try {
    const transcript = await YoutubeTranscript.fetchTranscript(videoUrl, {
      lang: "en",
    });
    //Get Video Title
    const videoInfo = await ytdl.getBasicInfo(videoUrl);
    const videoTitle = videoInfo.videoDetails.title;
    const thumbnails = videoInfo.videoDetails.thumbnails;
    const videoThumbnail = thumbnails[thumbnails.length - 1].url;

    //Get String of Video Steps
    const textOfTranscription = transcript.map((entry) => entry.text);
    const transcriptString = textOfTranscription.join(" ");
    const stepsString = await chatgpt(transcriptString);

    //Make sure it is  correct JSON format & wanted format  which is an  array  of strings
    const stepsJson = convertToJson(stepsString);
    const isCorrectJsonFormat = Array.isArray(stepsJson);
    const userId = res.locals.userId;

    if (stepsJson && isCorrectJsonFormat) {
      const newEntry = await db("workouts")
        .insert({
          title: videoTitle,
          image_url: videoThumbnail,
          steps: JSON.stringify(stepsJson),
          video_url: videoUrl,
          user_id: userId,
        })
        .returning("*");
      return res.status(200).send({ data: newEntry[0] });
    } else {
      res.status(400).send({ message: "Error  saving entry" });
    }
  } catch (error) {
    console.log(error);
    res.status(400).send({ message: "Error fetching transcript" });
  }
});

//GET (all Video entry of user)
app.get("/workouts", async (req, res) => {
  const userId = res.locals.userId;
  try {
    const workouts = await db("workouts").where({ user_id: userId }).select();
    res.status(200).send({ Workouts: workouts });
  } catch (error) {
    res.status(400).send({ message: "Error  retrieving videos" });
  }
});

app.listen(8080, () => {
  console.log("server listening on 8080");
});

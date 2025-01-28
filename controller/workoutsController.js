const db = require("../db/db");
const chatgpt = require("../util/openai");
const { YoutubeTranscript } = require("youtube-transcript");
const ytdl = require("@distube/ytdl-core");

//POST (save video from url and transcribes it)
const newWorkout = async (req, res) => {
  const videoUrl = req.body.video_url;
  //Validate the video URL
  if (!videoUrl) {
    return res.status(400).send({ message: "Enter a valid video URL." });
  }
  try {
    //Get the transcript & information of the video
    const transcript = await YoutubeTranscript.fetchTranscript(videoUrl, {
      lang: "en",
    });

    if (!transcript) {
      return res.status(400).send({
        message: "There was an error getting the transcript",
      });
    }

    const videoInfo = await ytdl.getBasicInfo(videoUrl);
    const videoTitle = videoInfo.videoDetails.title;
    const thumbnails = videoInfo.videoDetails.thumbnails;
    const videoThumbnail = thumbnails[thumbnails.length - 1].url;

    if (!videoTitle || !videoThumbnail) {
      throw new Error("Missing video title or thumbnail.");
    }
    //Convert transcript into string
    const textOfTranscription = transcript.map((entry) => entry.text);
    const transcriptString = textOfTranscription.join(" ");
    const stepsString = await chatgpt(transcriptString);
    const stepsJson = JSON.parse(stepsString);
    const isCorrectJsonFormat = Array.isArray(stepsJson);

    if (!stepsJson || !isCorrectJsonFormat) {
      throw new Error(
        "Invalid steps format. Steps should be an array of strings."
      );
    }
    //Save the new workout to the database
    const userId = res.locals.userId;

    try {
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
    } catch (err) {
      return res
        .status(500)
        .send({ message: "There was an  error saving the workout." });
    }
  } catch (error) {
    res.status(500).send({
      message: "There is an internal server error.",
    });
  }
};

//GET (all Video entry of user)
const getVideos = async (req, res) => {
  const userId = res.locals.userId;
  try {
    const workouts = await db("workouts").where({ user_id: userId }).select();
    res.status(200).send({ data: workouts });
  } catch (error) {
    res
      .status(400)
      .send({ message: "There was an error retrieving workouts." });
  }
};

//GET (one workout)
const getVideo = async (req, res) => {
  const userId = res.locals.userId;
  const videoId = req.params.id;
  try {
    const workout = await db("workouts")
      .where({ id: videoId, user_id: userId })
      .select()
      .first();

    if (!workout) {
      throw new Error("Cannot find workout.");
    }
    // if cant get the workout then throw error
    res.status(200).send({ data: workout });
  } catch (error) {
    res.status(404).send({ message: "The workout could not found." });
  }
};

module.exports = {
  newWorkout,
  getVideos,
  getVideo,
};

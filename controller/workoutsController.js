const db = require("../db/db");
const chatgpt = require("../util/openai");
const { YoutubeTranscript } = require("youtube-transcript");
const ytdl = require("@distube/ytdl-core");

//POST (save video from url and transcribes it)
const newWorkout = async (req, res) => {
  const videoUrl = req.body.video_url;

  if (!videoUrl) {
    return res.status(400).send({ message: "Invalid YouTube URL" });
  }
  //Some videos do not allow transcription, include error for this
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
    const stepsJson = JSON.parse(stepsString);
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
};

//GET (all Video entry of user)
const getVideos = async (req, res) => {
  const userId = res.locals.userId;
  try {
    const workouts = await db("workouts").where({ user_id: userId }).select();
    res.status(200).send({ data: workouts });
  } catch (error) {
    res.status(400).send({ message: "Error  retrieving videos" });
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
      throw new Error("Cannot find workout");
    }
    // if cant get the workout then throw error
    res.status(200).send({ data: workout });
  } catch (error) {
    // console.log(error);
    res.status(404).send({ message: "Not found" });
  }
};

module.exports = {
  newWorkout,
  getVideos,
  getVideo,
};

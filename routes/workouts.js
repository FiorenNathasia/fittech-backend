const express = require("express");
const router = express.Router();
const workoutsController = require("../controller/workoutsController");

router.post("/newworkout", workoutsController.newWorkout);
router.get("/", workoutsController.getVideos);
router.get("/:id", workoutsController.getVideo);

module.exports = router;

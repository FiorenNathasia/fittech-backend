const express = require("express");
const router = express.Router();
const workoutsController = require("../controller/workoutsController");

router.post("/", workoutsController.newWorkout);
router.get("/", workoutsController.getVideos);
router.get("/:id", workoutsController.getVideo);
router.delete("/:id", workoutsController.deleteWorkout);

module.exports = router;

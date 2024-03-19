const router = require("express").Router()
const { playerrank, leaderboard } = require("../controllers/score")
const { protectplayer } = require("../middleware/middleware")

router
    .get("/playerrank", protectplayer, playerrank)
    .get("/leaderboard", leaderboard)

module.exports = router;

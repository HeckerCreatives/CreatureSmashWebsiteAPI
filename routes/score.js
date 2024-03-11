const router = require("express").Router()
const { playerrank } = require("../controllers/score")
const { protectplayer } = require("../middleware/middleware")

router
    .get("/playerrank", protectplayer, playerrank)

module.exports = router;

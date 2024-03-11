const router = require("express").Router()
const { playerwallethistory } = require("../controllers/wallethistory")
const { protectplayer } = require("../middleware/middleware")

router
    .get("/playerwallethistory", protectplayer, playerwallethistory)

module.exports = router;

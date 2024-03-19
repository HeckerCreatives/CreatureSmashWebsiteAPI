const router = require("express").Router()
const { playerwallethistory, getplayerwallethistoryforadmin } = require("../controllers/wallethistory")
const { protectplayer, protectsuperadmin } = require("../middleware/middleware")

router
    .get("/playerwallethistory", protectplayer, playerwallethistory)
    .get("/getplayerwallethistoryforadmin", protectsuperadmin, getplayerwallethistoryforadmin)

module.exports = router;

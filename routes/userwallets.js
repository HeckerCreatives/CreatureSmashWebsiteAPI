const router = require("express").Router()
const { playerwallets } = require("../controllers/wallets")
const { protectplayer } = require("../middleware/middleware")

router
    .get("/playerwallets", protectplayer, playerwallets)

module.exports = router;

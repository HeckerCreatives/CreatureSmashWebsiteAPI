const router = require("express").Router()
const { buycreature } = require("../controllers/inventory")
const { protectplayer } = require("../middleware/middleware")

router
    .post("/buycreature", protectplayer, buycreature)

module.exports = router;

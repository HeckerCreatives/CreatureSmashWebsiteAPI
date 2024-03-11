const router = require("express").Router()
const { playerunilevel } = require("../controllers/unilevel")
const { protectplayer } = require("../middleware/middleware")

router
    .get("/playerunilevel", protectplayer, playerunilevel)

module.exports = router;

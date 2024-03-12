const router = require("express").Router()
const { getuserdetails } = require("../controllers/user")
const { protectplayer } = require("../middleware/middleware")

router
    .get("/getuserdetails", protectplayer, getuserdetails)

module.exports = router;

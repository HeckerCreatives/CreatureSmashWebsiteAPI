const router = require("express").Router()
const { buycreature, getinventory } = require("../controllers/inventory")
const { protectplayer } = require("../middleware/middleware")

router
    .get("/getinventory", protectplayer, getinventory)
    .post("/buycreature", protectplayer, buycreature)

module.exports = router;

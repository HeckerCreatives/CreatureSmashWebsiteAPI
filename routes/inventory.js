const router = require("express").Router()
const { buycreature, getinventory, getplayerinventoryforadmin } = require("../controllers/inventory")
const { protectplayer, protectsuperadmin } = require("../middleware/middleware")

router
    .get("/getinventory", protectplayer, getinventory)
    .get("/getplayerinventoryforadmin", protectsuperadmin, getplayerinventoryforadmin)
    .post("/buycreature", protectplayer, buycreature)

module.exports = router;

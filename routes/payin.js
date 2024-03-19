const router = require("express").Router()
const { getpayinlist, processpayin, getpayinhistorysuperadmin, requestpayin, getpayinhistoryplayer } = require("../controllers/payin")
const { protectsuperadmin, protectplayer } = require("../middleware/middleware")

router
    .get("/getpayinlist", protectsuperadmin, getpayinlist)
    .get("/getpayinhistorysuperadmin", protectsuperadmin, getpayinhistorysuperadmin)
    .get("/getpayinhistoryplayer", protectplayer, getpayinhistoryplayer)
    .post("/processpayin", protectsuperadmin, processpayin)
    .post("/requestpayin", protectplayer, requestpayin)

module.exports = router;

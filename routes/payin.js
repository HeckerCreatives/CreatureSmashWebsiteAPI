const router = require("express").Router()
const { getpayinlist, processpayin, getpayinhistorysuperadmin, requestpayin, getpayinhistoryplayer, getpayinhistoryadmin, sendfiattoplayer } = require("../controllers/payin")
const { protectsuperadmin, protectplayer, protectadmin } = require("../middleware/middleware")

router
    .get("/getpayinlist", protectsuperadmin, getpayinlist)
    .get("/getpayinhistorysuperadmin", protectsuperadmin, getpayinhistorysuperadmin)
    .get("/getpayinhistoryplayer", protectplayer, getpayinhistoryplayer)
    .get("/getpayinlistadmin", protectadmin, getpayinlist)
    .get("/getpayinhistoryadmin", protectadmin, getpayinhistoryadmin)
    .post("/processpayin", protectsuperadmin, processpayin)
    .post("/requestpayin", protectplayer, requestpayin)
    .post("/processpayinadmin", protectadmin, processpayin)
    .post("/superadminsendfiatplayer", protectsuperadmin, sendfiattoplayer)
    .post("/adminsendfiatplayer", protectadmin, sendfiattoplayer)

module.exports = router;

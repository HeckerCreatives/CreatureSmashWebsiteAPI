const router = require("express").Router()
const { getpayinlist, processpayin, getpayinhistorysuperadmin, requestpayin, getpayinhistoryplayer, getpayinhistoryadmin } = require("../controllers/payin")
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

module.exports = router;

const router = require("express").Router()
const { requestpayout, getrequesthistoryplayer, processpayout, getpayoutlist, getpayouthistorysuperadmin } = require("../controllers/payout")
const { protectsuperadmin, protectplayer } = require("../middleware/middleware")

router
    .get("/getrequesthistoryplayer", protectplayer, getrequesthistoryplayer)
    .get("/getpayoutlist", protectsuperadmin, getpayoutlist)
    .get("/getpayouthistorysuperadmin", protectsuperadmin, getpayouthistorysuperadmin)
    .post("/requestpayout", protectplayer, requestpayout)
    .post("/processpayout", protectsuperadmin, processpayout)

module.exports = router;

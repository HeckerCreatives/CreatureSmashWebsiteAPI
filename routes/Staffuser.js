const router = require("express").Router()
const { getsadashboard, getadminlist, updateadmin, banunbanuser } = require("../controllers/staffuser")
const { protectsuperadmin } = require("../middleware/middleware")

router
    .get("/getsadashboard", protectsuperadmin, getsadashboard)
    .get("/getadminlist", protectsuperadmin, getadminlist)
    .post("/updateadmin", protectsuperadmin, updateadmin)
    .post("/banunbanuser", protectsuperadmin, banunbanuser)

module.exports = router;

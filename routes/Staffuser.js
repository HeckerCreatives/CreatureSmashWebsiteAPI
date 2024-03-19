const router = require("express").Router()
const { getsadashboard, getadminlist, updateadmin, banunbanuser, getadmindashboard, changepass } = require("../controllers/staffuser")
const { protectsuperadmin, protectadmin } = require("../middleware/middleware")

router
    .get("/getsadashboard", protectsuperadmin, getsadashboard)
    .get("/getadminlist", protectsuperadmin, getadminlist)
    .get("/getadmindashboard", protectadmin, getadmindashboard)
    .post("/updateadmin", protectsuperadmin, updateadmin)
    .post("/banunbanuser", protectsuperadmin, banunbanuser)
    .post("/changepasssuperadmin", protectsuperadmin, changepass)
    .post("/changepasadmin", protectadmin, changepass)

module.exports = router;

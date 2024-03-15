const router = require("express").Router()
const { getsadashboard } = require("../controllers/staffuser")
const { protectsuperadmin } = require("../middleware/middleware")

router
    .get("/getsadashboard", protectsuperadmin, getsadashboard)

module.exports = router;

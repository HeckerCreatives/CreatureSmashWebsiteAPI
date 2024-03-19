const router = require("express").Router()
const { getmaintenance, changemaintenance } = require("../controllers/maintenance")
const { protectsuperadmin } = require("../middleware/middleware")

router
    .get("/getmaintenance", protectsuperadmin, getmaintenance)
    .post("/changemaintenance", protectsuperadmin, changemaintenance)

module.exports = router;

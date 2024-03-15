const router = require("express").Router()
const { authlogin, staffauthlogin, register, registerstaffs, getreferralusername, logout } = require("../controllers/auth")
const { protectsuperadmin } = require("../middleware/middleware")

router
    .get("/login", authlogin)
    .get("/staffauthlogin", staffauthlogin)
    .get("/getreferralusername", getreferralusername)
    .post("/register", register)
    .post("/registerstaffs", protectsuperadmin, registerstaffs)
    .get("/logout", logout)
module.exports = router;

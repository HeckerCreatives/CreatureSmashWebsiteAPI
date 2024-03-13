const router = require("express").Router()
const { authlogin, register, getreferralusername, logout } = require("../controllers/auth")

router
    .get("/login", authlogin)
    .get("/getreferralusername", getreferralusername)
    .post("/register", register)
    .get("/logout", logout)
module.exports = router;

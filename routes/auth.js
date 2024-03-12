const router = require("express").Router()
const { authlogin, register, getreferralusername } = require("../controllers/auth")

router
    .get("/login", authlogin)
    .get("/getreferralusername", getreferralusername)
    .post("/register", register)

module.exports = router;

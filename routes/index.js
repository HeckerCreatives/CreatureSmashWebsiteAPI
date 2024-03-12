const routers = app => {
    console.log("Routers are all available");

    app.use("/auth", require("./auth"))
    app.use("/wallets", require("./userwallets"))
    app.use("/score", require("./score"))
    app.use("/wallethistory", require("./wallethistory"))
    app.use("/unilevel", require("./unilevel"))
    app.use("/inventory", require("./inventory"))
    app.use("/user", require("./user"))
}

module.exports = routers
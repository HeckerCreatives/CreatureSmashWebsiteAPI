const routers = app => {
    console.log("Routers are all available");

    app.use("/auth", require("./auth"))
    app.use("/wallets", require("./userwallets"))
    app.use("/score", require("./score"))
    app.use("/wallethistory", require("./wallethistory"))
    app.use("/unilevel", require("./unilevel"))
    app.use("/inventory", require("./inventory"))
    app.use("/user", require("./user"))
    app.use("/picuploads", require('./picuploads'))
    app.use("/staffuser", require("./Staffuser"))
    app.use("/maintenance", require("./maintenance"))
    app.use("/payin", require("./payin"))
}

module.exports = routers
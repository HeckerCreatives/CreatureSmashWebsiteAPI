const router = require("express").Router()
const { getuserdetails, uploadprofilepicture, updateuserprofile, getreferrallink, banunbanuser, getplayerlist } = require("../controllers/user")
const { protectplayer, protectsuperadmin } = require("../middleware/middleware")
const pictureupload = require("../middleware/picuploads")

const uploadimg = pictureupload.single("file")

router
    .get("/getuserdetails", protectplayer, getuserdetails)
    .get("/getreferrallink", protectplayer, getreferrallink)
    .get("/getplayerlist", protectsuperadmin, getplayerlist)
    .post("/updateuserprofile", protectplayer, updateuserprofile)
    .post("/banunbanuser", protectsuperadmin, banunbanuser)
    .post("/uploadprofilepicture", protectplayer, function (req, res, next){
        uploadimg(req, res, function(err) {
            if (err){
                return res.status(400).send({ message: "failed", data: err.message })
            }

            next()
        })
    }, uploadprofilepicture)

module.exports = router;

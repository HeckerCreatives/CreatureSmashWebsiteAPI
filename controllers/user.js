const { default: mongoose } = require("mongoose")
const Userdetails = require("../models/Userdetails")

exports.getuserdetails = async (req, res) => {
    const {id} = req.user

    const details = await Userdetails.findOne({owner: new mongoose.Types.ObjectId(id)})
    .then(data => data)
    .catch()

    
}
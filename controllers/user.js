const { default: mongoose } = require("mongoose")
const Userdetails = require("../models/Userdetails")

exports.getuserdetails = async (req, res) => {
    const {id, username} = req.user

    const details = await Userdetails.findOne({owner: new mongoose.Types.ObjectId(id)})
    .then(data => data)
    .catch(err => {

        console.log(`There's a problem getting user details for ${username} Error: ${err}`)

        return res.status(400).json({ message: "bad-request", data: "There's a problem registering your account. Please try again." })
    })

    const data = {
        email: details.email,
        fistname: details.firstname,
        lastname: details.lastname,
        address: details.address,
        city: details.city,
        country: details.country,
        postalcode: details.postalcode,
        profilepicture: details.profilepicture
    }

    return res.json({message: "success", data: data})
}
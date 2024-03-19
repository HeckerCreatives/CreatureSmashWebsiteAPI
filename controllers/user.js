const { default: mongoose } = require("mongoose")
const Userdetails = require("../models/Userdetails")
const Users = require("../models/Users")
const fs = require("fs")

exports.getreferrallink = async (req, res) => {
    const {id} = req.user

    return res.json({message: "success", data: id})
}

exports.getuserdetails = async (req, res) => {
    const {id, username} = req.user

    const details = await Userdetails.findOne({owner: new mongoose.Types.ObjectId(id)})
    .then(data => data)
    .catch(err => {

        console.log(`There's a problem getting user details for ${username} Error: ${err}`)

        return res.status(400).json({ message: "bad-request", data: "There's a problem getting your user details. Please contact customer support." })
    })

    if (!details){
        return res.status(400).json({ message: "bad-request", data: "There's a problem with your account! Please contact customer support." })
    }

    const data = {
        username: username,
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

exports.updateuserprofile = async (req, res) => {
    const {id, username} = req.user
    const {firstname, lastname, address, city, country, postalcode} = req.body

    if (firstname == "" || lastname == "" || address == "" || city == "" || country == "" || postalcode == ""){
        return res.status(400).json({ message: "bad-request", data: "Please complete the form before updating!." })
    }

    await Userdetails.findOneAndUpdate({owner: new mongoose.Types.ObjectId(id)}, {firstname: firstname, lastname: lastname, address: address, city: city, country: country, postalcode: postalcode})
    .catch(err => {

        console.log(`There's a problem saving user details for ${username} Error: ${err}`)

        return res.status(400).json({ message: "bad-request", data: "There's a problem updating your user details. Please contact customer support." })
    })

    return res.json({message: "success"})
}

exports.uploadprofilepicture = async(req, res) => {
    const {id, username} = req.user

    let picture = "";

    if (req.file){
        picture = req.file.path
    }
    else{
        return res.status(400).json({ message: "failed", 
        data: "Please select a picture before uploading!" })
    }

    const details = await Userdetails.findOne({owner: new mongoose.Types.ObjectId(id)})
    .then(data => data)
    .catch(err => {

        console.log(`There's a problem getting user details for ${username} Error: ${err}`)

        return res.status(400).json({ message: "bad-request", data: "There's a problem getting you user details. Please contact customer support." })
    })

    if (details.profilepicture != ""){
        try {
            fs.unlinkSync(details.profilepicture)
        }
        catch(err){
            console.log(`Failed to delete profile picture ${err}`)
        }
    }

    await Userdetails.findOneAndUpdate({owner: new mongoose.Types.ObjectId(id)}, {profilepicture: picture})
    .catch(err => {

        console.log(`There's a problem updating user details for ${username} Error: ${err}`)

        return res.status(400).json({ message: "bad-request", data: "There's a problem uploading your creature picture. Please contact customer support." })
    })

    return res.json({message: "success"})
}

exports.getplayerlist = async (req, res) => {
    const {id, username} = req.user
    const {page, limit} = req.query

    const pageOptions = {
        page: parseInt(page) || 0,
        limit: parseInt(limit) || 10
    };

    const userlistpipeline = [
        {
            $facet: {
                totalCount: [
                    {
                        $count: "total"
                    }
                ],
                data: [
                    {
                        $lookup: {
                            from: "userdetails", // Assuming the collection name for UserDetails is "userdetails"
                            localField: "_id",
                            foreignField: "owner",
                            as: "userDetails"
                        }
                    },
                    {
                        $lookup: {
                            from: "users", // Assuming the collection name for Users is "users"
                            localField: "referral",
                            foreignField: "_id",
                            as: "referredUser"
                        }
                    },
                    {
                        $project: {
                            username: 1,
                            email: { $arrayElemAt: ["$userDetails.email", 0] },
                            referralUsername: { $arrayElemAt: ["$referredUser.username", 0] },
                            createdAt: 1,
                            status: 1
                        }
                    },
                    {
                        $skip: pageOptions.page * pageOptions.limit
                    },
                    {
                        $limit: pageOptions.limit
                    }
                ]
            }
        }
    ]

    const userlist = await Users.aggregate(userlistpipeline)
    .catch(err => {

        console.log(`There's a problem getting users list for ${username} Error: ${err}`)

        return res.status(400).json({ message: "bad-request", data: "There's a problem getting you user details. Please contact customer support." })
    })

    const data = {
        totalPages: Math.ceil(userlist[0].totalCount[0].total / pageOptions.limit),
        userlist: []
    }

    userlist[0].data.forEach(value => {
        const {username, status, createdAt, email, referralUsername} = value

        data["userlist"].push(
            {
                username: username,
                email: email,
                referralUsername: referralUsername,
                status: status,
                createdAt: createdAt
            }
        )
    })

    return res.json({message: "success", data: data})
}

exports.banunbanuser = async (req, res) => {
    const {id, username} = req.user
    const {status, userid} = req.body

    await Users.findOneAndUpdate({_id: new mongoose.Types.ObjectId(userid)}, {status: status})
    .catch(err => {

        console.log(`There's a problem banning or unbanning user for ${username}, player: ${userid}, status: ${status} Error: ${err}`)

        return res.status(400).json({ message: "bad-request", data: "There's a problem getting your user details. Please contact customer support." })
    })

    return res.json({message: "success"})
}

exports.getplayerwalletforadmin = async (req, res) => {
    // const {id, username} = req.user
    // const {username} = 
}
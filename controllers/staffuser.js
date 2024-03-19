const { default: mongoose } = require("mongoose")
const Analytics = require("../models/Analytics")
const Userwallets = require("../models/Userwallets")
const Users = require("../models/Users")
const Staffusers = require("../models/Staffusers")
const bcrypt = require('bcrypt');

exports.getsadashboard = async(req, res) => {
    const {id, username} = req.user

    const data = {}

    const commissiontotalpipeline = [
        {
            $match: {
                type: "commissionbalance"
            }
        },
        {
            $group: {
                _id: null,
                totalAmount: { $sum: "$amount" }
            }
        }
    ]

    const commission = await Analytics.aggregate(commissiontotalpipeline)
    .catch(err => {

        console.log(`There's a problem getting commission and buy aggregate for ${username} Error: ${err}`)

        return res.status(400).json({ message: "bad-request", data: `There's a problem with the server. Please try again later. Error: ${err}` })
    })

    data["commission"] = commission.length > 0 ? commission[0].totalAmount : 0

    const productspipeline = [
        {
            $match: {
                type: "Buy creature"
            }
        },
        {
            $group: {
                _id: null,
                totalAmount: { $sum: "$amount" }
            }
        }
    ]

    const products = await Analytics.aggregate(productspipeline)
    .catch(err => {

        console.log(`There's a problem getting commission aggregate for ${username} Error: ${err}`)

        return res.status(400).json({ message: "bad-request", data: `There's a problem with the server. Please try again later. Error: ${err}` })
    })

    data["products"] = products.length > 0 ? products[0].totalAmount : 0

    const commissioned = await Userwallets.findOne({owner: new mongoose.Types.ObjectId(process.env.CREATURESMASH_ID), type: "commissionbalance"})
    .then(data => data.amount)
    .catch(err => {

        console.log(`There's a problem getting commissioned for ${username} Error: ${err}`)

        return res.status(400).json({ message: "bad-request", data: `There's a problem with the server. Please try again later. Error: ${err}` })
    })
    
    data["commissioned"] = commissioned

    const usercount = await Users.countDocuments({username: { $ne: "creaturesmash"}})
    .then(data => data)
    .catch(err => {

        console.log(`There's a problem getting user count for ${username} Error: ${err}`)

        return res.status(400).json({ message: "bad-request", data: `There's a problem with the server. Please try again later. Error: ${err}` })
    })

    data["registered"] = usercount

    const payinpipline = [
        {
            $match: {
                type: "payinfiatbalance"
            }
        },
        {
            $group: {
                _id: null,
                totalAmount: { $sum: "$amount" }
            }
        }
    ]
    const payin = await Analytics.aggregate(payinpipline)
    .catch(err => {

        console.log(`There's a problem getting payin aggregate for ${username} Error: ${err}`)

        return res.status(400).json({ message: "bad-request", data: `There's a problem with the server. Please try again later. Error: ${err}` })
    })

    data["payin"] = payin.length > 0 ? payin[0].totalAmount : 0

    const payoutgamepipeline = [
        {
            $match: {
                type: "payoutgamebalance"
            }
        },
        {
            $group: {
                _id: null,
                totalAmount: { $sum: "$amount" }
            }
        }
    ]
    const payoutgame = await Analytics.aggregate(payoutgamepipeline)
    .catch(err => {

        console.log(`There's a problem getting payout game aggregate for ${username} Error: ${err}`)

        return res.status(400).json({ message: "bad-request", data: `There's a problem with the server. Please try again later. Error: ${err}` })
    })

    data["payoutgame"] = payoutgame.length > 0 ? payoutgame[0].totalAmount : 0

    const payoutcommissionpipeline = [
        {
            $match: {
                type: "payoutcommissionbalance"
            }
        },
        {
            $group: {
                _id: null,
                totalAmount: { $sum: "$amount" }
            }
        }
    ]
    const payoutcommission = await Analytics.aggregate(payoutcommissionpipeline)
    .catch(err => {

        console.log(`There's a problem getting payout commission aggregate for ${username} Error: ${err}`)

        return res.status(400).json({ message: "bad-request", data: `There's a problem with the server. Please try again later. Error: ${err}` })
    })
    
    data["payoutcommission"] = payoutcommission.length > 0 ? payoutcommission[0].totalAmount : 0

    data["payout"] = parseFloat(data["payoutgame"]) + parseFloat(data["payoutcommission"])

    return res.json({message: "success", data: data})
}

exports.banunbanuser = async (req, res) => {
    const {id, username} = req.user
    const {status, staffusername} = req.body

    await Staffusers.findOneAndUpdate({username: staffusername}, {status: status})
    .catch(err => {

        console.log(`There's a problem banning or unbanning user for ${username}, player: ${staffusername}, status: ${status} Error: ${err}`)

        return res.status(400).json({ message: "bad-request", data: "There's a problem getting your user details. Please contact customer support." })
    })

    return res.json({message: "success"})
}

exports.getadminlist = async (req, res) => {
    const {id, username} = req.user
    const {page, limit} = req.query

    const pageOptions = {
        page: parseInt(page) || 0,
        limit: parseInt(limit) || 10
    };

    const adminlist = await Staffusers.find({auth: {$ne: "superadmin"}})
    .skip(pageOptions.page * pageOptions.limit)
    .limit(pageOptions.limit)
    .sort({createdAt: -1})
    .catch(err => {
        console.log(`Failed to get admin list data for ${username}, error: ${err}`)

        return res.status(401).json({ message: 'failed', data: `There's a problem with your account. Please contact customer support for more details` })
    })

    const totalPages = await Staffusers.countDocuments({auth: {$ne: "superadmin"}})
    .then(data => data)
    .catch(err => {

        console.log(`Failed to count documents staff users data for ${username}, error: ${err}`)

        return res.status(401).json({ message: 'failed', data: `There's a problem with your account. Please contact customer support for more details` })
    })

    const pages = Math.ceil(totalPages / pageOptions.limit)

    const data = {
        users: [],
        totalPages: pages
    }

    adminlist.forEach(value => {
        const {username, status, createdAt} = value

        data["users"].push(
            {
                username: username,
                status: status,
                createdAt: createdAt
            }
        )
    });

    return res.json({message: "success", data: data})
}

exports.updateadmin = async (req, res) => {
    const {id, username} = req.user
    const {staffusername, password} = req.body

    if (password == ""){
        return res.status(400).json({ message: "failed", data: "Please complete the form first before saving!" })
    }

    const hashPassword = bcrypt.hashSync(password, 10)

    await Staffusers.findOneAndUpdate({username: staffusername}, {password: hashPassword})
    .catch(err => {

        console.log(`There's a problem updating user data for ${staffusername}, admin execution: ${username} Error: ${err}`)

        return res.status(400).json({ message: "bad-request", data: "There's a problem getting your user details. Please contact customer support." })
    })

    return res.json({message: "success"})
}
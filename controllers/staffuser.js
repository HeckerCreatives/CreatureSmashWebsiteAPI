const { default: mongoose } = require("mongoose")
const Analytics = require("../models/Analytics")
const Userwallets = require("../models/Userwallets")
const Users = require("../models/Users")

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

    data["payin"] = 0
    data["payout"] = 0
    data["payoutcommission"] = 0
    data["payoutgame"] = 0

    return res.json({message: "success", data: data})
}
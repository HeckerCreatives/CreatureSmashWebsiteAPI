const { default: mongoose } = require("mongoose")
const Inventory = require("../models/Inventory")
const { creaturedata } = require("../utils/inventorytools")
const { walletbalance, reducewallet } = require("../utils/walletstools")
const { DateTimeServerExpiration } = require("../utils/datetimetools")
const { addanalytics } = require("../utils/analyticstools")

exports.buycreature = async (req, res) => {
    const {id, username} = req.user
    const {type, qty} = req.body

    const wallet = await walletbalance("fiatbalance", id)

    if (wallet == "failed"){
        return res.status(401).json({ message: 'failed', data: `There's a problem with your account. Please contact customer support for more details` })
    }

    if (wallet == "nodata"){
        return res.status(401).json({ message: 'failed', data: `There's a problem with your account. Please contact customer support for more details` })
    }

    const price = creaturedata(type)

    if (wallet < price.amount){
        return res.status(401).json({ message: 'failed', data: `You don't have enough funds to buy this creature! Please top up first and try again.` })
    }

    const buy = await reducewallet("fiatbalance", price.amount, id)

    if (buy != "success"){
        return res.status(401).json({ message: 'failed', data: `You don't have enough funds to buy this creature! Please top up first and try again.` })
    }

    const exist = await Inventory.findOne({owner: new mongoose.Types.ObjectId(id), type: type})
    .then(data => data)
    .catch(err => {

        console.log(`Failed to get inventory data for ${username} type: ${type}, error: ${err}`)

        return "failed"
    })

    if (!exist){
        await Inventory.create({owner: new mongoose.Types.ObjectId(id), qty: qty, expiration: DateTimeServerExpiration(price.expiration), rank: price.rank, totalaccumulated: 0, dailyaccumulated: 0})
        .catch(err => {

            console.log(`Failed to create inventory data for ${username} type: ${type}, error: ${err}`)

            return "failed"
        })
    }
    else{
        await Inventory.findOneAndUpdate({owner: new mongoose.Types.ObjectId(id), type: type}, {$inc: {qty: qty}})
        .catch(err => {

            console.log(`Failed to update inventory data for ${username} type: ${type}, error: ${err}`)

            return "failed"
        })
    }

    await addanalytics(id, `Buy creature`, `Player ${username} bought ${price.name} creature`, price.amount)

    return res.json({message: "success"})
}

exports.getinventory = async (req, res) => {
    const {id} = req.user
    const {rank, page, limit} = req.query

    const pageOptions = {
        page: parseInt(page) || 0,
        limit: parseInt(limit) || 10
    }

    const creatures = await Inventory.find({owner: id, rank: rank})
    .skip(pageOptions.page * pageOptions.limit)
    .limit(pageOptions.limit)
    .sort({'createdAt': -1})
    .then(data => data)
    .catch(err => {

        console.log(`Failed to get inventory data for ${id} rank: ${rank}, error: ${err}`)

        return "failed"
    })

    const totalPages = await Inventory.countDocuments({owner: id, rank: rank})
    .then(data => data)
    .catch(err => {

        console.log(`Failed to count inventory data for ${id} rank: ${rank}, error: ${err}`)

        return "failed"
    })

    const pages = Math.ceil(totalPages / pageOptions.limit)

    const data = {}

    creatures.forEach(datacreatures => {
        const {type, rank, dailyaccumulated, totalaccumulated, qty} = datacreatures

        data[type] = {
            rank: rank,
            qty: qty,
            dailyaccumulated: dailyaccumulated,
            totalaccumulated: totalaccumulated
        }
    })

    data["totalPages"] = pages

    return res.json({message: "success", data: data})
}
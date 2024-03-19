const { default: mongoose } = require("mongoose");
const Wallethistory = require("../models/Wallethistory")

exports.playerwallethistory = async (req, res) => {
    const {id, username} = req.user
    const {type, page, limit} = req.query

    const pageOptions = {
        page: parseInt(page) || 0,
        limit: parseInt(limit) || 10
    };

    const history = await Wallethistory.find({owner: new mongoose.Types.ObjectId(id), type: type})
    .populate({
        path: "from",
        select: "username -_id"
    })
    .skip(pageOptions.page * pageOptions.limit)
    .limit(pageOptions.limit)
    .sort({createdAt: -1})
    .then(data => data)
    .catch(err => {

        console.log(`Failed to get wallet history data for ${username}, wallet type: ${type}, error: ${err}`)

        return res.status(401).json({ message: 'failed', data: `There's a problem with your account. Please contact customer support for more details` })
    })
    
    const historypages = await Wallethistory.countDocuments({owner: new mongoose.Types.ObjectId(id), type: type})
    .then(data => data)
    .catch(err => {

        console.log(`Failed to get wallet history count document data for ${username}, wallet type: ${type}, error: ${err}`)

        return res.status(401).json({ message: 'failed', data: `There's a problem with your account. Please contact customer support for more details` })
    })

    const totalPages = Math.ceil(historypages / pageOptions.limit)

    const data = {
        history: {},
        pages: totalPages
    }

    history.forEach(historydata => {
        const {type, amount, from, _id, createdAt} = historydata

        data.history[_id] = {
            type: type,
            amount: amount,
            from: from,
            createdAt: createdAt
        }
    })

    return res.json({message: "success", data: data})
}

exports.getplayerwallethistoryforadmin = async (req, res) => {
    const {id, username} = req.user
    const {playerid, type, page, limit} = req.query

    const pageOptions = {
        page: parseInt(page) || 0,
        limit: parseInt(limit) || 10
    };

    const history = await Wallethistory.find({owner: new mongoose.Types.ObjectId(playerid), type: type})
    .populate({
        path: "from",
        select: "username -_id"
    })
    .skip(pageOptions.page * pageOptions.limit)
    .limit(pageOptions.limit)
    .sort({createdAt: -1})
    .then(data => data)
    .catch(err => {

        console.log(`Failed to get wallet history data for ${username}, wallet type: ${type}, player: ${playerid} error: ${err}`)

        return res.status(401).json({ message: 'failed', data: `There's a problem with your account. Please contact customer support for more details` })
    })
    
    const historypages = await Wallethistory.countDocuments({owner: new mongoose.Types.ObjectId(playerid), type: type})
    .then(data => data)
    .catch(err => {

        console.log(`Failed to get wallet history count document data for ${username}, wallet type: ${type}, player: ${playerid} error: ${err}`)

        return res.status(401).json({ message: 'failed', data: `There's a problem with your account. Please contact customer support for more details` })
    })

    const totalPages = Math.ceil(historypages / pageOptions.limit)

    const data = {
        history: [],
        pages: totalPages
    }

    history.forEach(historydata => {
        const {type, amount, from, _id, createdAt} = historydata

        data.history.push({
            type: type,
            amount: amount,
            from: from,
            createdAt: createdAt
        })
    })

    return res.json({message: "success", data: data})
}
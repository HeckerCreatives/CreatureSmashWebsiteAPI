const { default: mongoose } = require("mongoose");
const Wallethistory = require("../models/Wallethistory")

exports.playerwallethistory = async (req, res) => {
    const {id, username} = req.user
    const {type, page, limit} = req.query

    const pageOptions = {
        page: parseInt(page) || 0,
        limit: parseInt(limit) || 10
    };
    
    const wallethistorypipeline = [
        {
            $match: {
                owner: new mongoose.Types.ObjectId(id), 
                type: type
            }
        },
        {
            $lookup: {
                from: "staffusers",
                localField: "from",
                foreignField: "_id",
                as: "staffuserinfo"
            }
        },
        {
            $unwind: "$staffuserinfo"
        },
        {
            $lookup: {
                from: "users",
                localField: "owner",
                foreignField: "_id",
                as: "userinfo"
            }
        },
        {
            $unwind: "$userinfo"
        },
        {
            $project: {
                type: 1,
                amount: 1,
                fromusername: "$staffuserinfo.username",
                username: "$userinfo.username",
                createdAt: 1
            }
        },
        {
            $skip: pageOptions.page * pageOptions.limit
        },
        {
            $limit: pageOptions.limit
        }
    ]

    const history = await Wallethistory.aggregate(wallethistorypipeline)
    .catch(err => {

        console.log(`Failed to get wallet history data for ${username}, wallet type: ${type}, player: ${playerid} error: ${err}`)

        return res.status(401).json({ message: 'failed', data: `There's a problem with your account. Please contact customer support for more details` })
    })
    
    const historypages = await Wallethistory.countDocuments({owner: new mongoose.Types.ObjectId(id), type: type})
    .then(data => data)
    .catch(err => {

        console.log(`Failed to get wallet history count document data for ${username}, wallet type: ${type}, player: ${id} error: ${err}`)

        return res.status(401).json({ message: 'failed', data: `There's a problem with your account. Please contact customer support for more details` })
    })

    const totalPages = Math.ceil(historypages / pageOptions.limit)

    const data = {
        history: [],
        pages: totalPages
    }

    history.forEach(historydata => {
        const {username, type, amount, fromusername, createdAt} = historydata

        console.log(historydata)

        data.history.push({
            username: username,
            type: type,
            amount: amount,
            fromusername: fromusername,
            createdAt: createdAt
        })
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
    
    const wallethistorypipeline = [
        {
            $match: {
                owner: new mongoose.Types.ObjectId(playerid), 
                type: type
            }
        },
        {
            $lookup: {
                from: "staffusers",
                localField: "from",
                foreignField: "_id",
                as: "staffuserinfo"
            }
        },
        {
            $unwind: "$staffuserinfo"
        },
        {
            $lookup: {
                from: "users",
                localField: "owner",
                foreignField: "_id",
                as: "userinfo"
            }
        },
        {
            $unwind: "$userinfo"
        },
        {
            $project: {
                type: 1,
                amount: 1,
                fromusername: "$staffuserinfo.username",
                username: "$userinfo.username",
                createdAt: 1
            }
        },
        {
            $skip: pageOptions.page * pageOptions.limit
        },
        {
            $limit: pageOptions.limit
        }
    ]

    const history = await Wallethistory.aggregate(wallethistorypipeline)
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
        const {username, type, amount, fromusername, createdAt} = historydata

        console.log(historydata)

        data.history.push({
            username: username,
            type: type,
            amount: amount,
            fromusername: fromusername,
            createdAt: createdAt
        })
    })

    return res.json({message: "success", data: data})
}
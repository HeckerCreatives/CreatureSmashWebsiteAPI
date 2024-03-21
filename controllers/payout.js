const { default: mongoose } = require("mongoose")
const Payout = require("../models/Payout")
const Userwallets = require("../models/Userwallets")
const { addwallethistory } = require("../utils/wallethistorytools")
const { addanalytics } = require("../utils/analyticstools")

exports.requestpayout = async (req, res) => {
    const {id, username} = req.user
    const {type, payoutvalue} = req.body

    const wallet = await Userwallets.findOne({owner: new mongoose.Types.ObjectId(id), type: type})
    .then(data => data)
    .catch(err => {
        console.log(`There's a problem getting leaderboard data ${err}`)
        return res.status(400).json({ message: "bad-request", data: "There's a problem with the server! Please contact customer support for more details." })
    })

    if (payoutvalue > wallet.data){
        return res.status(400).json({ message: "failed", data: "The amount is greater than your wallet balance" })
    }

    await Userwallets.findOneAndUpdate({owner: new mongoose.Types.ObjectId(id), type: type}, {$inc: {amount: -payoutvalue}})
    .catch(err => {
        console.log(`There's a problem getting leaderboard data ${err}`)
        return res.status(400).json({ message: "bad-request", data: "There's a problem with the server! Please contact customer support for more details." })
    })

    await Payout.create({owner: new mongoose.Types.ObjectId(id), status: "processing", value: payoutvalue, type: type})
    .catch(async err => {

        await Userwallets.findOneAndUpdate({owner: new mongoose.Types.ObjectId(id), type: type}, {$inc: {amount: payoutvalue}})
        .catch(err => {
            console.log(`There's a problem getting leaderboard data ${err}`)
            return res.status(400).json({ message: "bad-request", data: "There's a problem with the server! Please contact customer support for more details." })
        })

        console.log(`There's a problem getting leaderboard data ${err}`)
        return res.status(400).json({ message: "bad-request", data: "There's a problem with the server! Please contact customer support for more details." })
    })

    return res.json({message: "success"})
}

exports.getrequesthistoryplayer = async (req, res) => {
    const {id, username} = req.user
    const {type, page, limit} = req.query

    const pageOptions = {
        page: parseInt(page) || 0,
        limit: parseInt(limit) || 10
    }

    const payouthistory = await Payout.find({owner: new mongoose.Types.ObjectId(id), type: type})
    .populate({
        path: "owner processby",
        select: "username -_id"
    })
    .skip(pageOptions.page * pageOptions.limit)
    .limit(pageOptions.limit)
    .sort({'createdAt': -1})
    .then(data => data)
    .catch(err => {
        console.log(`There's a problem getting leaderboard data ${err}`)
        return res.status(400).json({ message: "bad-request", data: "There's a problem with the server! Please contact customer support for more details." })
    })

    const totalPages = await Payout.countDocuments({owner: new mongoose.Types.ObjectId(id), type: type})
    .then(data => data)
    .catch(err => {

        console.log(`Failed to count documents Payin data for ${username}, error: ${err}`)

        return res.status(401).json({ message: 'failed', data: `There's a problem with your account. Please contact customer support for more details` })
    })

    const pages = Math.ceil(totalPages / pageOptions.limit)

    const data = {
        totalPages: pages,
        history: []
    }

    payouthistory.forEach(valuedata => {
        const {owner, processby, status, value, type} = valuedata

        data.history.push({
            owner: owner.username,
            processby: processby != null ? processby.username : "",
            status: status,
            value: value,
            type: type
        })
    })

    return res.json({message: "success", data: data})
}

exports.getpayoutlist = async (req, res) => {
    const {id, username} = req.user
    const {type, page, limit} = req.query
    
    const pageOptions = {
        page: parseInt(page) || 0,
        limit: parseInt(limit) || 10
    }

    const payoutpipelinelist = [
        {
            $match: {
                status: "processing"
            }
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
            $lookup: {
                from: "userdetails",
                localField: "owner",
                foreignField: "owner",
                as: "userdetails"
            }
        },
        {
            $unwind: "$userdetails"
        },
        {
            $project: {
                _id: 1,
                status: 1,
                value: 1,
                type: 1,
                username: "$userinfo.username",
                userid: "$userinfo._id",
                paymentmethod: "$userdetails.paymentmethod",
                accountnumber: "$userdetails.accountnumber"
            }
        },
        {
            $skip: pageOptions.page * pageOptions.limit
        },
        {
            $limit: pageOptions.limit
        }
    ]

    const payoutlist = await Payout.aggregate(payoutpipelinelist)

    const totalPages = await Payout.countDocuments({status: "processing", type: type})
    .then(data => data)
    .catch(err => {

        console.log(`Failed to count documents Payin data for ${username}, error: ${err}`)

        return res.status(401).json({ message: 'failed', data: `There's a problem with your account. Please contact customer support for more details` })
    })

    const pages = Math.ceil(totalPages / pageOptions.limit)

    const data = {
        payoutlist: [],
        totalPages: pages
    }
    
    payoutlist.forEach(valuedata => {
        const {_id, owner, processby, status, value, type} = valuedata

        data.payoutlist.push({
            id: _id,
            owner: owner,
            processby: processby != null ? processby : "",
            status: status,
            value: value,
            type: type
        })
    })

    return res.json({message: "success", data: data})
}

exports.getpayouthistorysuperadmin = async (req, res) => {
    const {id, username} = req.user
    const {type, page, limit} = req.query
    
    const pageOptions = {
        page: parseInt(page) || 0,
        limit: parseInt(limit) || 10
    }

    const payoutlist = await Payout.find({type: type, $or: [{status: "done"}, {status: "reject"}]})
    .populate({
        path: "owner processby",
        select: "username _id"
    })
    .skip(pageOptions.page * pageOptions.limit)
    .limit(pageOptions.limit)
    .sort({'createdAt': -1})
    .then(data => data)
    .catch(err => {

        console.log(`Failed to get payout list data for ${username}, error: ${err}`)

        return res.status(401).json({ message: 'failed', data: `There's a problem with your account. Please contact customer support for more details` })
    })

    const totalPages = await Payout.countDocuments({type: type, $or: [{status: "done"}, {status: "reject"}]})
    .then(data => data)
    .catch(err => {

        console.log(`Failed to count documents Payin data for ${username}, error: ${err}`)

        return res.status(401).json({ message: 'failed', data: `There's a problem with your account. Please contact customer support for more details` })
    })

    const pages = Math.ceil(totalPages / pageOptions.limit)

    const data = {
        history: [],
        totalPages: pages
    }
    
    payoutlist.forEach(valuedata => {
        const {_id, owner, processby, status, value, type} = valuedata

        data.history.push({
            id: _id,
            owner: owner,
            processby: processby != null ? processby : "",
            status: status,
            value: value,
            type: type
        })
    })

    return res.json({message: "success", data: data})
}

exports.getpayouthistoryadmin = async (req, res) => {
    const {id, username} = req.user
    const {type, page, limit} = req.query
    
    const pageOptions = {
        page: parseInt(page) || 0,
        limit: parseInt(limit) || 10
    }

    const payoutlist = await Payout.find({type: type, processby: new mongoose.Types.ObjectId(id), $or: [{status: "done"}, {status: "reject"}]})
    .populate({
        path: "owner processby",
        select: "username _id"
    })
    .skip(pageOptions.page * pageOptions.limit)
    .limit(pageOptions.limit)
    .sort({'createdAt': -1})
    .then(data => data)
    .catch(err => {

        console.log(`Failed to get payout list data for ${username}, error: ${err}`)

        return res.status(401).json({ message: 'failed', data: `There's a problem with your account. Please contact customer support for more details` })
    })

    const totalPages = await Payout.countDocuments({type: type, processby: new mongoose.Types.ObjectId(id), $or: [{status: "done"}, {status: "reject"}]})
    .then(data => data)
    .catch(err => {

        console.log(`Failed to count documents Payin data for ${username}, error: ${err}`)

        return res.status(401).json({ message: 'failed', data: `There's a problem with your account. Please contact customer support for more details` })
    })

    const pages = Math.ceil(totalPages / pageOptions.limit)

    const data = {
        history: [],
        totalPages: pages
    }
    
    payoutlist.forEach(valuedata => {
        const {_id, owner, processby, status, value, type} = valuedata

        data.history.push({
            id: _id,
            owner: owner,
            processby: processby != null ? processby : "",
            status: status,
            value: value,
            type: type
        })
    })

    return res.json({message: "success", data: data})
}

exports.processpayout = async (req, res) => {
    const {id, username} = req.user
    const {payoutid, status} = req.body

    let payoutvalue = 0
    let playerid = ""
    let wallettype = ""

    const payoutdata = await Payout.findOne({_id: new mongoose.Types.ObjectId(payoutid)})
    .then(data => data)
    .catch(err => {

        console.log(`Failed to get Payout data for ${username}, error: ${err}`)

        return res.status(401).json({ message: 'failed', data: `There's a problem with your account. Please contact customer support for more details` })
    })

    if (payoutdata.status != "processing"){
        return res.status(401).json({ message: 'failed', data: `You already processed this payout` })
    }

    await Payout.findOneAndUpdate({_id: new mongoose.Types.ObjectId(payoutid)}, {status: status, processby: new mongoose.Types.ObjectId(id)})
    .then(data => {
        payoutvalue = data.value
        playerid = data.owner._id
        wallettype = data.type
    })
    .catch(err => {

        console.log(`Failed to count documents Payin data for ${username}, error: ${err}`)

        return res.status(401).json({ message: 'failed', data: `There's a problem with your account. Please contact customer support for more details` })
    })

    if (status == "reject"){
        await Userwallets.findOneAndUpdate({owner: new mongoose.Types.ObjectId(playerid), type: wallettype}, {$inc: {amount: payoutvalue}})
        .catch(err => {

            console.log(`Failed to process Payout data for ${username}, player: ${playerid}, payinid: ${payinid} error: ${err}`)
    
            return res.status(401).json({ message: 'failed', data: `There's a problem with your account. Please contact customer support for more details` })
        })
    }
    else{
        const wallethistoryadd = await addwallethistory(playerid, wallettype, payoutvalue, id)

        if (wallethistoryadd != "success"){
            return res.status(401).json({ message: 'failed', data: `There's a problem saving payin in wallet history. Please contact customer support for more details` })
        }

        const analyticsadd = await addanalytics(playerid, `payout${wallettype}`, `Payout to user ${playerid} with a value of ${payoutvalue} processed by ${username}`, payoutvalue)

        if (analyticsadd != "success"){
            return res.status(401).json({ message: 'failed', data: `There's a problem saving payin in analytics history. Please contact customer support for more details` })
        }
    }

    return res.json({message: "success"})
}
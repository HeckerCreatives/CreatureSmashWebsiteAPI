const { default: mongoose } = require("mongoose");
const Users = require("../models/Users")

exports.playerunilevel = async (req, res) => {
    const {id} = req.user
    const {level, page, limit} = req.query

    const pageOptions = {
        page: parseInt(page) || 0,
        limit: parseInt(limit) || 10
    };

    const downline = await Users.aggregate([
        {
            $match: {
                _id: new mongoose.Types.ObjectId(id),
            },
        },
        {
            $graphLookup: {
                from: "users",
                startWith: "$_id",
                connectFromField: "_id",
                connectToField: "referral",
                as: "ancestors",
                depthField: "level",
            },
        },
        {
            $unwind: "$ancestors",
        },
        {
            $match: {
                "ancestors.level": parseInt(level),
            },
        },
        {
            $replaceRoot: { newRoot: "$ancestors" },
        },
        {
            $addFields: {
                level: { $add: ["$level", 1] },
            },
        },
        {
            $project: {
                _id: 0, // Exclude _id field
                username: 1,
                level: 1,
            },
        },
        {
            $group: {
                _id: "$level",
                data: { $push: "$$ROOT" },
                totalDocuments: { $sum: 1 }, // Calculate total documents
            },
        },
        {
            $sort: { _id: 1 }, // Sort by level
        },
        {
            $match: {
                _id: { $lte: 10 }, // Only include levels up to 10
            },
        },
        {
            $project: {
                _id: 1,
                data: {
                    $slice: [
                        {
                            $map: {
                                input: "$data",
                                as: "doc",
                                in: {
                                    username: "$$doc.username",
                                    level: "$$doc.level",
                                },
                            },
                        },
                        pageOptions.page * pageOptions.limit,
                        pageOptions.limit,
                    ],
                },
                totalDocuments: 1,
                totalPages: {
                    $ceil: { $divide: ["$totalDocuments", pageOptions.limit] },
                },
            },
        },
    ]);
    
    return res.json({message: "success", data: downline})
}
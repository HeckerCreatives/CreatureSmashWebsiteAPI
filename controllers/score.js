const { default: mongoose } = require("mongoose")
const Score = require("../models/Score")

exports.playerrank = async (req, res) => {
    const {id} = req.user
    const data = {}

    const playerlb = await Score.findOne({owner: new mongoose.Types.ObjectId(id)})
    .then(data => data)
    .catch(err => {

        console.log(`Failed to get score data for ${data.owner}, error: ${err}`)

        return res.status(401).json({ message: 'failed', data: `There's a problem with your account. Please contact customer support for more details` })
    })

    if (!playerlb){

        console.log(`No score data for ${playerlb.owner}`)

        return res.status(401).json({ message: 'failed', data: `There's a problem with your account. Please contact customer support for more details` })
    }

    const rank = await Score.countDocuments({amount: {$gte: playerlb.amount}})
    .then(data => data)
    .catch(err => {

        console.log(`Failed to count documents score data for ${data.owner}, error: ${err}`)

        return res.status(401).json({ message: 'failed', data: `There's a problem with your account. Please contact customer support for more details` })
    })

    data["rank"] = rank

    return res.json({message: "success", data: data})
}

exports.leaderboard = async (req, res) => {
    const leaderboardpipeline = [
        {
          $lookup: {
            from: "users",  // Assuming your collection name is "gameusers"
            localField: "owner",
            foreignField: "_id",
            as: "user"
          }
        },
        {
          $unwind: "$user"
        },
        {
          $sort: {
            "amount": -1  // Sort in descending order based on the amount
          }
        },
        {
          $limit: 10  // Limit the result to the top 15 users
        },
        {
          $project: {
            _id: "$user._id",
            username: "$user.username",
            amount: 1  // Include other fields as needed
          }
        }
    ]

    const leaderboardagg = await Score.aggregate(leaderboardpipeline)
    .catch(err => {
        console.log(`There's a problem getting leaderboard data ${err}`)
        return res.status(400).json({ message: "bad-request", data: "There's a problem with the server! Please contact customer support for more details." })
    })

    const data = {
        leaderboard: []
    }

    let index = 1;

    leaderboardagg.forEach(leaderboarddata => {
        const {username, amount} = leaderboarddata

        data.leaderboard.push({
            rank: index,
            username: username,
            amount: amount
        })

        index++;
    })

    return res.json({message: "success", data: data})
}
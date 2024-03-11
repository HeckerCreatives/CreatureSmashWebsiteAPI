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
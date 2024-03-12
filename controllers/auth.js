const Users = require("../models/Users")
const Userwallets = require("../models/Userwallets")
const Score = require("../models/Score")
const Userdetails = require("../models/Userdetails")
const fs = require('fs')

const bcrypt = require('bcrypt');
const jsonwebtokenPromisified = require('jsonwebtoken-promisified');
const path = require("path");

const { DateTimeServer } = require("../utils/datetimetools")
const privateKey = fs.readFileSync(path.resolve(__dirname, "../keys/private-key.pem"), 'utf-8');
const { default: mongoose } = require("mongoose");

const encrypt = async password => {
    const salt = await bcrypt.genSalt(10);
    return await bcrypt.hash(password, salt);
}

exports.register = async (req, res) => {
    const { username, password, referral, email } = req.body

    const searchreferral = await Users.findOne({_id: new mongoose.Types.ObjectId(referral)})
    .then(data => data)
    .catch(err => {
        console.log(`There's a problem searching referral for ${username} referralid: ${referral} Error: ${err}`)

        return res.status(400).json({ message: "bad-request", data: "Referral does not exist! Please don't tamper with the url." })
    })

    if (!searchreferral){
        console.log(`referral id not exist for ${username} referralid: ${referral} Error: ${err}`)

        return res.status(400).json({ message: "bad-request", data: "Referral does not exist! Please don't tamper with the url." })
    }

    const user = await Users.findOne({username: { $regex: new RegExp('^' + username + '$', 'i') }})
    .then(data => data)
    .catch(err => {

        console.log(`There's a problem searching user for ${username} Error: ${err}`)

        return res.status(400).json({ message: "bad-request", data: "There's a problem registering your account. Please try again." })
    })

    if (user){
        return res.status(400).json({message: "failed", data: "You already registered this account! Please login if this is yours."})
    }

    const player = await Users.create({username: username, password: password, referral: new mongoose.Types.ObjectId(referral), gametoken: "", webtoken: "", bandate: "none", banreason: "", status: "active"})
    .catch(err => {

        console.log(`There's a problem creating user for ${username} Error: ${err}`)

        return res.status(400).json({ message: "bad-request", data: "There's a problem registering your account. Please try again." })
    })

    await Score.create({owner: new mongoose.Types.ObjectId(player._id), amount: 0})
    .catch(async err => {

        await Users.findOneAndDelete({_id: new mongoose.Types.ObjectId(player._id)})

        console.log(`There's a problem creating user details for ${player._id} Error: ${err}`)

        return res.status(400).json({ message: "bad-request", data: "There's a problem registering your account. Please try again." })
    })

    await Userdetails.create({email: email, fistname: "", lastname: "", address: "", city: "", country: "", postalcode: "", profilepicture: ""})
    .catch(async err => {

        await Users.findOneAndDelete({_id: new mongoose.Types.ObjectId(player._id)})

        await Score.findOneAndDelete({_id: new mongoose.Types.ObjectId(player._id)})

        console.log(`There's a problem creating user details for ${player._id} Error: ${err}`)

        return res.status(400).json({ message: "bad-request", data: "There's a problem registering your account. Please try again." })
    })

    const wallets = ["fiatbalance", "gamebalance", "commissionbalance"]

    wallets.forEach(async (data) => {
        await Userwallets.create({owner: new mongoose.Types.ObjectId(player._id), type: data, amount: 0})
        .catch(async err => {

            await Users.findOneAndDelete({_id: new mongoose.Types.ObjectId(player._id)})

            await Score.findOneAndDelete({_id: new mongoose.Types.ObjectId(player._id)})

            await Userdetails.findOneAndDelete({_id: new mongoose.Types.ObjectId(player._id)})

            console.log(`There's a problem creating user wallet for ${player._id} with type ${data} Error: ${err}`)

            return res.status(400).json({ message: "bad-request", data: "There's a problem registering your account. Please try again." })
        })
    })


    return res.json({message: "success"})
}

exports.authlogin = async(req, res) => {
    const { username, password } = req.query;

    Users.findOne({ username: { $regex: new RegExp('^' + username + '$', 'i') } })
    .then(async user => {
        if (user && (await user.matchPassword(password))){
            if (user.status != "active"){
                return res.status(401).json({ message: 'failed', data: `Your account had been ${user.status}! Please contact support for more details.` });
            }

            const token = await encrypt(privateKey)

            await Users.findByIdAndUpdate({_id: user._id}, {$set: {webtoken: token}}, { new: true })
            .then(async () => {
                const payload = { id: user._id, username: user.username, status: user.status, token: token }

                let jwtoken = ""

                try {
                    jwtoken = await jsonwebtokenPromisified.sign(payload, privateKey, { algorithm: 'RS256' });
                } catch (error) {
                    console.error('Error signing token:', error.message);
                    return res.status(500).json({ error: 'Internal Server Error', data: "There's a problem signing in! Please contact customer support for more details! Error 004" });
                }

                const data = {
                    token: jwtoken,
                    datetime: DateTimeServer()
                }

                res.cookie('sessionToken', jwtoken, { secure: true, sameSite: 'None' } )
                return res.json({message: "success"})
            })
            .catch(err => res.status(400).json({ message: "bad-request2", data: "There's a problem with your account! There's a problem with your account! Please contact customer support for more details."  + err }))
        }
        else{
            return res.json({message: "nouser", data: "Username/Password does not match! Please try again using the correct credentials!"})
        }
    })
    .catch(err => res.status(400).json({ message: "bad-request1", data: "There's a problem with your account! There's a problem with your account! Please contact customer support for more details." }))
}
const { default: mongoose } = require("mongoose")
const Users = require("../models/Users")
const Userwallets = require("../models/Userwallets")
const Userdetails = require("../models/Userdetails")
const Score = require("../models/Score")

exports.initialize = async (req, res) => {

    //  INITIALIZE CREATURE SMASH USER
    const csadmin = await Users.findOne({username: "creaturesmash"})
    .then(data => data)
    .catch(err => res.status(400).json({ message: "bad-request", data: err.message }))

    if (!csadmin){
        const player = await Users.create({_id: new mongoose.Types.ObjectId("65eeeeabd9576a4f8ae38afd"), username: "creaturesmash", password: "e7FNO0EWgW11", gametoken: "", webtoken: "", bandate: "none", banreason: "", status: "active"})
        

        await Score.create({owner: new mongoose.Types.ObjectId(player._id), amount: 0})
        .catch(async err => {

            await Users.findOneAndDelete({_id: new mongoose.Types.ObjectId(player._id)})

            console.log(`Server Initialization Failed, Error: ${err}`);

            return
        })
        
        await Userdetails.create({email: "", fistname: "", lastname: "", address: "", city: "", country: "", postalcode: "", profilepicture: ""})
        .catch(async err => {

            await Users.findOneAndDelete({_id: new mongoose.Types.ObjectId(player._id)})

            await Score.findOneAndDelete({_id: new mongoose.Types.ObjectId(player._id)})

            console.log(`Server Initialization Failed, Error: ${err}`);

            return
        })
    
        const wallets = ["fiatbalance", "gamebalance", "commissionbalance"]

        wallets.forEach(async (data) => {
            await Userwallets.create({owner: new mongoose.Types.ObjectId(player._id), type: data, amount: 0})
            .catch(async err => {

                await Users.findOneAndDelete({_id: new mongoose.Types.ObjectId(player._id)})

                await Score.findOneAndDelete({_id: new mongoose.Types.ObjectId(player._id)})

                await Userdetails.findOneAndDelete({_id: new mongoose.Types.ObjectId(player._id)})

                console.log(`Server Initialization Failed, Error: ${err}`);
    
                return
            })
        })
    }

    console.log("Server Initialization Success")
}
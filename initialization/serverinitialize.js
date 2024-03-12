const { default: mongoose } = require("mongoose")
const Users = require("../models/Users")
const Userwallets = require("../models/Userwallets")
const Userdetails = require("../models/Userdetails")
const Score = require("../models/Score")
const Maintenance = require("../models/Maintenance")

exports.initialize = async (req, res) => {

    //  INITIALIZE CREATURE SMASH USER
    const csadmin = await Users.findOne({username: "creaturesmash"})
    .then(data => data)
    .catch(err => {
        console.log(`There's a problem getting cs user data ${err}`)
        return
    })

    if (!csadmin){
        const player = await Users.create({_id: new mongoose.Types.ObjectId("65eeeeabd9576a4f8ae38afd"), username: "creaturesmash", password: "e7FNO0EWgW11", gametoken: "", webtoken: "", bandate: "none", banreason: "", status: "active"})
        

        await Score.create({owner: new mongoose.Types.ObjectId(player._id), amount: 0})
        .catch(async err => {

            await Users.findOneAndDelete({_id: new mongoose.Types.ObjectId(player._id)})

            console.log(`Server Initialization Failed, Error: ${err}`);

            return
        })
        
        await Userdetails.create({owner: new mongoose.Types.ObjectId(player._id), email: "", fistname: "", lastname: "", address: "", city: "", country: "", postalcode: "", profilepicture: ""})
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

    const maintenancelist = await Maintenance.find()
    .then(data => data)
    .catch(err => {
        console.log("there's a problem getting maintenance list")

        return
    })

    if (maintenancelist.length <= 0){
        const maintenancelistdata = ["fightgame", "eventgame", "fullgame"]

        maintenancelistdata.forEach(async maintenancedata => {
            await Maintenance.create({type: maintenancedata, value: "0"})
            .catch(err => {
                console.log(`there's a problem creating maintenance list ${err}`)

                return
            })
        })
    }

    console.log("Server Initialization Success")
}
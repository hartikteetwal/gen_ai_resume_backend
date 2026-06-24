const mongoose = require("mongoose")

async function connectToDB() {
    try {
        
    mongoose.connect(process.env.MONGO_URI)

    await console.log("Connected to DataBase")

    } catch (error) {
        console.log("Error",error)
    }
}

module.exports = connectToDB

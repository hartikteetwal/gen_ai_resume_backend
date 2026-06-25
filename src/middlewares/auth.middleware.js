const jwt = require("jsonwebtoken")
const tokenBlacklistModel = require("../models/blacklist.model")

async function authUser(req, res, next) {
    const token = req.cookies.token
    if (!token) {
        return res.status(401).json({message:"Token not provided",success:false})
    }

    const isTokenBlacklist = await tokenBlacklistModel.findOne({
        token
    })

    if (isTokenBlacklist) {
        return res.status(401).json({
            success: true,
            message:"Token is invalid"
        })
    }
    try {
        
        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        req.user = decoded
        next()

    } catch (error) {
        return res.status(401).json({message:"Invalid token",success:false})
    }


}

module.exports = {authUser}
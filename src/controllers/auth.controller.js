const jwt = require("jsonwebtoken");
const userModel = require("../models/user.model");
const bcrypt = require("bcrypt");
const tokenBlacklistModel = require("../models/blacklist.model");

async function registerUserController(req, res) {
    const { username, email, password } = req.body
    try {

        if (!username || !email || !password) {
            return res.status(400).json({ success: false, message: "Please provide username email and password" })
        }
        const isUserExisit = await userModel.findOne({
            $or: [{ email }, { username }]
        })

        if (password.length < 8) {
            return res.status(400).json({
                success: false, message: "Password must be 8 char long"
            })
        }

        if (isUserExisit) {
            return res.status(400).json({
                success: false,
                message: "Account already exist with this username and email"
            })
        }

        const hash = await bcrypt.hash(password, 10)

        const user = await userModel.create({
            username, email, password: hash
        })

        const token = jwt.sign({ id: user._id, username: user.username }, process.env.JWT_SECRET, { expiresIn: "1d" })
        res.cookie("token", token, {
            httpOnly: true,
            secure: true,
            sameSite: "none",
        });

        return res.status(201).json({
            success: true, message: "User registerd successfully", user: {
                id: user._id,
                password: user.password,
                email: user.email
            }
        })

    } catch (error) {
        return res.status(500).json({ message: "Internal server error", success: false })
        console.log("Error", error)
    }
}


async function loginUserController(req, res) {
    const { email, password } = req.body
    try {

        const user = await userModel.findOne({email})
        if (!user) {
            return res.status(400).json({
                success: false, message: "User is not exist for this account"
            })
        }

        if (password.length < 8) {
            return res.status(400).json({
                success: false, message: "Password must be 8 char long"
            })
        }

        const isPasswordValid = await bcrypt.compare(password, user.password)
        if (!isPasswordValid) {
            return res.status(400).json({
                success: false, message: "Please enter a valid password"
            })
        }

        const token = jwt.sign({ id: user._id, username: user.username }, process.env.JWT_SECRET, { expiresIn: "1d" })
        res.cookie("token", token, {
            httpOnly: true,
            secure: true,
            sameSite: "none",
            path: "/"
        })

        return res.status(200).json({
            success: true, message: "User Login successfully", user: { id: user._id, username: user.username, email: user.email }
        })

    } catch (error) {
        console.log("Error", error)
        return res.status(500).json({ message: "Internal server error", success: false })
    }
}

async function logoutUserController(req, res) {
    const token = req.cookies.token
    if (token) {
        await tokenBlacklistModel.create({token})
    }

    res.clearCookie("token")

    return res.status(200).json({
        success:true,message:"Logout Successfully"
    })
}


async function getMeController(req, res) {
    const user = await userModel.findById(req.user.id)

    res.status(200).json({
        message: "user detail fetched successfully",
        success:true,
        user:{
        id: user._id,
        username: user.username,
        email:user.email
    }})
}


module.exports = { registerUserController, loginUserController, logoutUserController, getMeController }
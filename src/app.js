const express = require("express")
const authRouter = require("./routes/auth.route")
const cookieParser = require("cookie-parser")
const cors = require("cors")
const interviewRouter = require("./routes/interview.Routes")

const app = express()

app.use(cors({
    origin: "http://localhost:5173",
    credentials:true
}))

app.use(express.json())
app.use(cookieParser())

app.use("/api/auth",authRouter)
app.use("/api/interview",interviewRouter)



module.exports = app
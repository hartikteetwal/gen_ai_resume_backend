const express = require("express")
const authRouter = require("./routes/auth.route")
const cookieParser = require("cookie-parser")
const cors = require("cors")
const interviewRouter = require("./routes/interview.routes")

const app = express()

const allowedOrigins = [
    "http://localhost:5173",
    "https://your-frontend.vercel.app",
];
app.use(cors({
    origin: allowedOrigins,
    credentials:true
}))

app.use(express.json())
app.use(cookieParser())

app.use("/api/auth",authRouter)
app.use("/api/interview",interviewRouter)



module.exports = app
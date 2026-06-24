const express = require("express")
const authRouter = require("./routes/auth.route")
const cookieParser = require("cookie-parser")
const cors = require("cors")
const interviewRouter = require("./routes/interview.routes")

const app = express()

const cors = require("cors");

app.use(
    cors({
        origin: [
            "http://localhost:5173",
            "https://gen-ai-resume-frontend.vercel.app",
        ],
        credentials: true,
        methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        allowedHeaders: ["Content-Type", "Authorization"],
    })
);

app.use(express.json())
app.use(cookieParser())

app.use("/api/auth",authRouter)
app.use("/api/interview",interviewRouter)



module.exports = app
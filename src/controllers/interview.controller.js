const { PDFParse } = require("pdf-parse")
const interviewReportModel = require("../models/interviewReport.model");
const { generateInterviewReport, generateResumePdf } = require("../services/ai.service");


/**
 * 
 * @param {*} req 
 * @param {*} res 
 * @returns 
 */

async function generateInterviewReportController(req, res) {
    const resumeFile = req.resumeFile

    const pdf = new PDFParse(
        new Uint8Array(req.file.buffer)
    );

    const resumeContent = await pdf.getText();

    const { selfDescription, jobDescription } = req.body

    const interviewReportByAi = await generateInterviewReport({
        resume: resumeContent.text, selfDescription, jobDescription
    })

    const interviewReport = await interviewReportModel.create({
        user: req.user.id, resume: resumeContent.text,
        selfDescription, jobDescription
        , ...interviewReportByAi
    })

    return res.status(201).json({
        success: true, message: "interview report generated sucessfully", interviewReport
    })

}

async function getInterviewReportByIdController(req, res) {
    try {
        const { interviewId } = req.params;
        console.log("interviewId", interviewId)

        // Validate if interviewId is provided
        if (!interviewId) {
            return res.status(400).json({
                success: false,
                message: "Interview ID is required"
            });
        }

        // Fetch the interview report for the authenticated user
        const interviewReport = await interviewReportModel.findOne({
            _id: interviewId,
            user: req.user.id
        });

        console.log("response", {
            _id: interviewId,
            user: req.user.id
        }, interviewReport)

        // Check if interview report exists
        if (!interviewReport) {
            return res.status(404).json({
                success: false,
                message: "Interview report not found"
            });
        }

        return res.status(200).json({
            success: true,
            message: "Interview report fetched successfully",
            interviewReport
        });
    } catch (error) {
        console.error("Error fetching interview report:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to fetch interview report",
            error: process.env.NODE_ENV === "development" ? error.message : "Internal server error"
        });
    }
}

async function getAllInterviewReportsController(req, res) {
    try {
        // Get pagination parameters from query
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        // Fetch all interview reports for the authenticated user with pagination
        const interviewReports = await interviewReportModel.find({ user: req.user.id })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .select("-resume -selfDescription -jobDescription -_v  -skillGaps -preparationPlan");
        // Get total count for pagination
        const totalReports = await interviewReportModel.countDocuments({ user: req.user.id });
        const totalPages = Math.ceil(totalReports / limit);

        // Check if reports exist
        if (interviewReports.length === 0) {
            return res.status(200).json({
                success: true,
                message: "No interview reports found",
                data: [],
                pagination: {
                    currentPage: page,
                    totalPages,
                    totalReports,
                    limit
                }
            });
        }

        return res.status(200).json({
            success: true,
            message: "Interview reports fetched successfully",
            interviewReports,
            pagination: {
                currentPage: page,
                totalPages,
                totalReports,
                limit
            }
        });
    } catch (error) {
        console.error("Error fetching interview reports:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to fetch interview reports",
            error: process.env.NODE_ENV === "development" ? error.message : "Internal server error"
        });
    }
}

/**
 * @description controller to generate resume pdf based on user self description, resume and job description.
 */

async function generateResumePdfController(req,res) {
    const { interviewId } = req.params
    const interviewReport = await interviewReportModel.findOne({
        _id: interviewId,
        user: req.user.id
    });
    
    if (!interviewReport) {
        return res.status(404).json({ success: false, message: "Interview report not found" })
    }

    const {resume,jobDescription,selfDescription} = interviewReport

    const pdfBuffer = await generateResumePdf({ resume, jobDescription, selfDescription })
    
    res.set({
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename=resume_${interviewId}.pdf`
    })

    res.send(pdfBuffer)
}

module.exports = { generateInterviewReportController, getInterviewReportByIdController, getAllInterviewReportsController, generateResumePdfController }
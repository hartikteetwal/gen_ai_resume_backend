const express = require("express")
const { authUser } = require("../middlewares/auth.middleware")
const { generateInterviewReportController, getInterviewReportByIdController, getAllInterviewReportsController, generateResumePdfController } = require("../controllers/interview.controller")
const upload = require("../middlewares/file.middleware")

const interviewRouter = express.Router()

/**
 * @route POST /api/interview
 * @description generate new interview report on the bases of use self description resume pdf and job description
 * @access private
 */
interviewRouter.post("/", authUser, upload.single("resume"), generateInterviewReportController)

/**
 * @route GET /api/interview/reports
 * @description get all interview reports for authenticated user with pagination
 * @access private
 * @query page - page number (default: 1)
 * @query limit - number of reports per page (default: 10)
 */
interviewRouter.get("/reports", authUser, getAllInterviewReportsController)

/**
 * @route GET /api/interview/report/:Id
 * @description get interview report by interviewId
 * @access private 
 */

interviewRouter.get("/report/:interviewId", authUser, getInterviewReportByIdController)

/**
 * @route GET /api/interview/resume/pdf:Id
 * @description generate resume pdf on the basis of user self description, resume content and job description
 * @access private 
*/
interviewRouter.get("/resume/pdf/:interviewId", authUser, generateResumePdfController)

module.exports = interviewRouter
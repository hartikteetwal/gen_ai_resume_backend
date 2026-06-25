const { GoogleGenAI } = require("@google/genai");
const { z } = require("zod")
const { zodToJsonSchema } = require("zod-to-json-schema");
const puppeteer = require("puppeteer");

const ai = new GoogleGenAI({
    apiKey:process.env.GOOGLE_GENAI_API_KEY
})

const interviewReportSchema = z.object({
    matchScore: z.number().describe("A score between 0 and 100 indicating how well the candidate's profile matchs the job description"),
    technicalQuestions: z.array(z.object({
        question: z.string().describe("The technical question that may be asked during the interview"),
        intention: z.string().describe("The reason why the interviewer is asking this question and what they want to evaluate"),
        answer: z.string().describe("Recommended approach to answer the question, including key concepts, examples, and points to cover")
    })).describe("Technical questions that can be asked in the interview along with their intention and suggested answers"),

    behavioralQuestions: z.array(z.object({
        question: z.string().describe("The behavioral question that may be asked during the interview"),
        intention: z.string().describe("The reason why the interviewer is asking this question and the qualities they are evaluating"),
        answer: z.string().describe("Recommended approach to answer the question using relevant examples and experiences")
    })).describe("Behavioral questions that can be asked in the interview along with their intention and suggested answers"),

    skillGaps: z.array(z.object({
        skill: z.string().describe("The skill or knowledge area that the candidate appears to be lacking"),
        severity: z.enum(["low", "medium", "high"]).describe("The importance of improving this skill for the target role")
    })).describe("List of skill gaps identified in the candidate's profile along with their severity"),

    preparationPlan: z.array(z.object({
        day: z.number().describe("Day number in the interview preparation schedule"),
        focus: z.string().describe("The primary topic, skill, or area that the candidate should focus on for that day"),
        tasks: z.array(z.string()).describe("Specific learning activities, practice exercises, projects, mock interviews, or study tasks to complete on that day")
    })).describe("A day-by-day interview preparation roadmap tailored to the candidate's profile and target role")
});
async function generateInterviewReport({ resume ,selfDescription , jobDescription}) {

const prompt = `Generate an interview report for a candidate with the following details:
Resume: ${resume}
Self Description: ${selfDescription}
Job Description: ${jobDescription}

Please analyze the profile against the job description and populate the structured report.

Generate:

- Exactly 10 technical questions
- Exactly 10 behavioral questions
- Minimum 5 skill gaps
- 7 day preparation plan

Do not leave any field empty.
Do not return null.
Do not return empty arrays.
`;


    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        
        config: {
            responseMimeType: "application/json",

            responseSchema: {
                type: "object",
                properties: {
                    matchScore: {
                        type: "number"
                    },

                    technicalQuestions: {
                        type: "array",
                        items: {
                            type: "object",
                            properties: {
                                question: { type: "string" },
                                intention: { type: "string" },
                                answer: { type: "string" }
                            },
                            required: [
                                "question",
                                "intention",
                                "answer"
                            ]
                        }
                    },

                    behavioralQuestions: {
                        type: "array",
                        items: {
                            type: "object",
                            properties: {
                                question: { type: "string" },
                                intention: { type: "string" },
                                answer: { type: "string" }
                            },
                            required: [
                                "question",
                                "intention",
                                "answer"
                            ]
                        }
                    },

                    skillGaps: {
                        type: "array",
                        items: {
                            type: "object",
                            properties: {
                                skill: { type: "string" },
                                severity: {
                                    type: "string",
                                    enum: ["low", "medium", "high"]
                                }
                            },
                            required: [
                                "skill",
                                "severity"
                            ]
                        }
                    },

                    preparationPlan: {
                        type: "array",
                        items: {
                            type: "object",
                            properties: {
                                day: { type: "number" },
                                focus: { type: "string" },
                                tasks: {
                                    type: "array",
                                    items: {
                                        type: "string"
                                    }
                                }
                            },
                            required: [
                                "day",
                                "focus",
                                "tasks"
                            ]
                        }
                    },
                    title: {
                        type:"string"
                    }
                },
                required: [
                    "matchScore",
                    "technicalQuestions",
                    "behavioralQuestions",
                    "skillGaps",
                    "preparationPlan",
                    "title"
                ]
            }
        }
    });

    console.log(response.text);
    const report = JSON.parse(response.text);
    return report;
}


async function generatePdfFromHtml(htmlContent) {
    const browser = await puppeteer.launch({
        headless: true,
        args: [
            "--no-sandbox",
            "--disable-setuid-sandbox",
            "--disable-dev-shm-usage",
            "--disable-gpu"
        ]
    });

    const page = await browser.newPage();

    await page.setContent(htmlContent, {
        waitUntil: "networkidle2",
    });

    const pdfBuffer = await page.pdf({
        format: "A4",
        margin: {
            top: "5mm",
            bottom: "5mm",
            left: "10mm",
            right: "10mm",
        },
    });

    await browser.close();
    return pdfBuffer;
}

async function generateResumePdf({ resume, selfDescription, jobDescription }) {
    const resumePdfSchema = z.object({
        html:z.string().describe("The HTML content of the resume which can be converted to pdf using any library like puppeteer")
    })

    const prompt = `Generate resume for a candidate with the following details:
    Resume:${resume}
    Self Description:${selfDescription}
    Job Description:${jobDescription}

    the response should be a JSON object with a single field "html" which contains the HTML content of the resume which can be converted to PDF using any library like puppeteer.

    the resume should be tailored for the given job description snd should highlight the candidate's strengths and relavent experience. The HTML content should be well-formatted and structured, making it easy to read and visible apealing.
    
    the content of resume should be not sound like it's generated by AI and should be close as possible to a real human-written resume.

    you can highlight the content useing some color or different font style but the overall design should be simple and professional.

    The content should be ATS friendly, i.e. it should be easily persable by ATS system without important information.

    The resume should not be so lengthy, it must be 1 page log when when convert to PDF. Focus on the quality rether then quantity and makke sure to include all the relavent information that can increse the candidate's chance of getting an interview call for the given job description.
    
    use light professional resume color.`



    const response = await ai.models.generateContent({
        // model: "gemini-2.5-flash",
        model: "gemini-3-flash-preview",
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema:zodToJsonSchema(resumePdfSchema)
        }
    }
    )

    const jsonContent = JSON.parse(response.text)
    const pdfBuffer = await generatePdfFromHtml(jsonContent.html)
    return pdfBuffer
}



module.exports = { generateInterviewReport, generateResumePdf }
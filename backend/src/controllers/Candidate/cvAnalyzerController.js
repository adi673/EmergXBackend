const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

exports.analyzeCV = async (req, res) => {
    try {
        const { cv, jd } = req.body;
        const prompt = `
You are a smart and unbiased AI CV screening assistant. Your task is to evaluate how well a candidate's resume (CV) matches a job description. The job description may include one or more roles and may contain responsibilities, expectations, and skill requirements.

Carefully review both the CV and the Job Description, and provide the output as a **valid JSON object** with the following keys:

1. **score** (integer): Rate the match from 0 to 100 based on relevance of experience, skills, and qualifications. If the score is above 85, cap it at 95.
2. **reasoning** (string): Provide a concise but insightful explanation of how you arrived at this score — mention key matching points like role alignment, experience, and relevant technologies.
3. **skills_available** (array of 6 or fewer strings): List up to 6 skills or competencies from the CV that strongly align with the job description.
4. **missing** (array of 6 or fewer strings): List up to 6 important skills, experiences, or qualifications the candidate lacks based on the job description. If nothing is missing, return a single string in the array: "You are good to go".

CV:
"""
${cv}
"""

Job Description:
"""
${jd}
"""
`;
        const model = genAI.getGenerativeModel({
            model: "models/gemini-2.0-flash",
        });
        const result = await model.generateContent(prompt);
        const text = result.response.text();

        const jsonStart = text.indexOf("{");
        const jsonEnd = text.lastIndexOf("}") + 1;
        const jsonString = text.slice(jsonStart, jsonEnd);

        const parsed = JSON.parse(jsonString);

        if (parsed.score > 85) {
            parsed.score = 95;
        }
        res.status(200).json({ success: true, result:parsed });
    } catch (error) {
        console.error('Error analyzing CV:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};
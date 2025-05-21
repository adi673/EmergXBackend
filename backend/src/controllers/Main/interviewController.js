const Interview = require('../../models/Interview'); // Your Interview model
const Prompt = require('../../models/Prompt');       // Your Prompt model

exports.createInterview = async (req, res) => {
    const { title, duration, shortDescription, longDescription, prompt: promptText } = req.body;

    try {
        // 1. Create the Prompt first (without interviewId initially)
        const prompt = new Prompt({
            prompt: promptText,
            //   createdBy: req.user._id,
        });

        await prompt.save();

        // 2. Create the Interview and link promptId
        const interview = new Interview({
            title,
            duration,
            shortDescription,
            longDescription,
            //   createdBy: req.user._id,
            promptId: prompt._id,
        });

        await interview.save();

        // 3. Now update the prompt with interviewId (to establish 2-way link)
        prompt.interviewId = interview._id;
        await prompt.save();

        res.status(201).json({
            success: true,
            message: 'Interview created successfully',
            interview,
            prompt,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};




exports.getAllInterviews = async function getAllInterviews(req, res) {
    try {
        const interviews = await Interview.find({})
            .select('title shortDescription longDescription _id')
            .lean();

        const formattedInterviews = interviews.map(({ _id, title, shortDescription, longDescription }) => ({
            interviewId: _id,
            title,
            shortDescription,
            longDescription,
        }));

        res.status(200).json({ success: true, interviews: formattedInterviews });

    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
}

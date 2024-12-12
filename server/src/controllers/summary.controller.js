const pdf = require("pdf-parse");
const { GoogleGenerativeAI } = require("@google/generative-ai");

const handleGetSummary = async (req, res) => {
    console.log("Getting summary...");

    try {
        const file = req.file;

        if (!file) {
            console.log("No file provided");

            return res.status(400).json({ msg: "No file provided" });
        }

        // extract text from the file
        const text = await extractTextFromPDF(file);

        console.log("Text extracted...");

        // get summary from the text
        const summary = await getSummary(text);

        console.log("Summary extracted...");

        return res.status(200).json({ msg: "Summary extracted", summary });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ msg: "Internal server error" });
    }
};

module.exports = { handleGetSummary };

// Helper function to extract text from a PDF file using pdf-parse
const extractTextFromPDF = async (file) => {
    try {
        // create a buffer from the file
        const buffer = file.buffer;

        const data = await pdf(buffer);

        const text = data.text;

        return text;
    } catch (error) {
        throw new Error("Error extracting text from PDF");
    }
};

// Helper function to get summary from text
const getSummary = async (text) => {
    try {
        const model = new GoogleGenerativeAI(
            process.env.GEMINI_AI_API_KEY
        ).getGenerativeModel({ model: "gemini-1.5-flash" });

        const prompt =
            "Summarize the following text into a concise and meaningful overview, capturing the key points and essential details in a clear and coherent manner:\n\n\n" +
            text;

        const result = await model.generateContent(prompt);

        const summary = result.response.text();

        return summary;
    } catch (error) {
        throw new Error("Error getting summary");
    }
};

// Helper function to extract text from a PDF file using pdfjs-dist
// const extractTextFromPDF = async (file) => {
//     const pdfjsLib = await import("pdfjs-dist/legacy/build/pdf.mjs");

//     // create a buffer from the file
//     const buffer = fs.readFileSync(file.path);
//     const data = new Uint8Array(buffer);

//     const loadingTask = pdfjsLib.getDocument(data);

//     const pdf = await loadingTask.promise;

//     const text = [];

//     for (let i = 1; i <= pdf.numPages; i++) {
//         const page = await pdf.getPage(i);

//         const content = await page.getTextContent();

//         const strings = content.items.map((item) => item.str);

//         text.push(strings.join(""));
//     }

//     return text.join("\n");
// };

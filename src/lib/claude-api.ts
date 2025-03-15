import axios from "axios";

const CLAUDE_API_URL = "https://api.anthropic.com/v1/messages";
const CLAUDE_API_KEY = process.env.CLAUDE_API_KEY;
const CLAUDE_MODEL = "claude-3-5-sonnet-20240307"; // Using Claude 3.5 Sonnet

if (!CLAUDE_API_KEY) {
	console.error("CLAUDE_API_KEY is not set in environment variables");
}

// Helper function to make requests to Claude API
async function makeClaudeRequest(
	messages: {
		role: string;
		content: string;
	}[],
	system?: string,
	maxTokens = 1024,
): Promise<string> {
	try {
		const response = await axios.post(
			CLAUDE_API_URL,
			{
				model: CLAUDE_MODEL,
				max_tokens: maxTokens,
				system: system,
				messages: messages,
			},
			{
				headers: {
					"Content-Type": "application/json",
					"x-api-key": CLAUDE_API_KEY,
					"anthropic-version": "2023-06-01",
				},
			},
		);

		return response.data.content[0].text;
	} catch (error) {
		console.error("Error making Claude API request:", error);
		throw error;
	}
}

// Evaluate user's answer against the target answer
export async function evaluateAnswer(
	question: string,
	targetAnswer: string,
	userAnswer: string,
) {
	const system = `You are assisting the user in their study. Compare their answer to the provided target answer. 
                  Use your best judgment to determine whether the answer would pass, considering that the target answer 
                  is just a guideline and not a model to be matched perfectly.
                  If their answer is incorrect or insufficient, explain the difference between the answer they provided 
                  and what the correct answer is and how to fix it. If the answer is correct, start your response with "Correct!". 
                  If it is incorrect, start your response with "Incorrect". 
                  If the current question asks about a user's personal background (experience or inclinations), 
                  ignore the target answer and mark the answer as correct.
                  Ensure your response is conversational and use Markdown formatting.
                  If they are incorrect, direct them to relevant documentation with the following format:
                  You can find further information on this topic at:  
                  [Source Name](<link>)`;

	const messages = [
		{
			role: "user",
			content: `Question: "${question}"\nTarget Answer: "${targetAnswer}"\nUser's Answer: "${userAnswer}"`,
		},
	];

	const response = await makeClaudeRequest(messages, system);
	const isCorrect =
		response.includes("Correct!") && !response.includes("Incorrect");

	return {
		message: response,
		correct: isCorrect,
	};
}

// Generate questions from document content
export async function generateQuestions(
	documentContent: string,
	numQuestions = 10,
): Promise<{ question: string; answer: string }[]> {
	const system = `You are an expert study assistant. Your task is to create high-quality study questions based on the 
                  document content provided. For each question, also generate a comprehensive answer that would be 
                  considered correct. Focus on important concepts, key details, and testing understanding rather than 
                  memorization. Create a diverse set of questions that cover the main topics in the document.`;

	const messages = [
		{
			role: "user",
			content: `Generate ${numQuestions} study questions and answers based on the following document. Return your response 
                as a JSON array where each item has "question" and "answer" fields.\n\nDocument content:\n${documentContent}`,
		},
	];

	const response = await makeClaudeRequest(messages, system, 4000);

	// Extract the JSON part of the response
	try {
		const jsonMatch = response.match(/\[[\s\S]*\]/);
		if (jsonMatch) {
			return JSON.parse(jsonMatch[0]);
		}
		// Fallback in case the response doesn't contain valid JSON
		const cleanedResponse = response.replace(/```json|```/g, "").trim();
		return JSON.parse(cleanedResponse);
	} catch (error) {
		console.error("Error parsing questions JSON:", error);
		throw new Error("Failed to parse generated questions");
	}
}

// Extract text from PDF content (base64)
export async function extractPdfText(pdfBase64: string) {
	const system = `You are a document processing assistant. Your task is to extract the text content from 
                  the PDF that has been converted to base64. Extract as much text as possible while maintaining 
                  the structure and formatting to the extent possible.`;

	const messages = [
		{
			role: "user",
			content: `Extract the text from this PDF content (base64 encoded). Ignore any images, 
                charts, or non-textual elements. Just return the raw text.\n\n${pdfBase64.substring(0, 100000)}`,
		},
	];

	return await makeClaudeRequest(messages, system, 4000);
}

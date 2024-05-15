import type { NextApiRequest, NextApiResponse } from "next";
import axios, { AxiosError, AxiosResponse } from "axios";
import { NextResponse, NextRequest } from "next/server";

type Question = {
  question: string;
  answer: string;
};

export async function POST(req: NextRequest) {
  let input: string;
  let apiKey: string | undefined;
  let openai: any;
  let apiCheck: boolean;

  try {
    const questionData = await req.json();
    input = questionData.input;
    apiKey = questionData.apiKey;
    apiCheck = questionData.apiCheck;
  } catch (error: any) {
    console.error("Error parsing request body:", error);
    return NextResponse.json(
      { error: "Invalid request body" },
      { status: 400 }
    );
  }

  const currentAPI = apiKey || process.env.OPENAI_API_KEY;

  if (!currentAPI) {
    return NextResponse.json(
      { error: "API key is required" },
      { status: 400 }
    );
  }

  try {
    openai = axios.create({
      baseURL: "https://api.openai.com/v1",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${currentAPI}`,
      },
    });
  } catch (error: any) {
    console.error("Error creating OpenAI client:", error);
    return NextResponse.json(
      { error: "Failed to create OpenAI client" },
      { status: 500 }
    );
  }

  const parseInput = async (input: string) => {
    try {
      const requestData = {
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: `You are an assistant that helps users organize their study material. The user will provide a text with questions (and optionally answers). 
                    Your task is to parse the input and return a structured format of questions and answers. If an answer is missing, answer it yourself.`,
          },
          {
            role: "user",
            content: `Here are some questions (with optionally provided answers):\n\n${input}\n\nPlease parse this into an array of objects with "question" and 
                    "answer" keys. Ensure each question has an answer. If a demo answer is provided, use that; otherwise answer it yourself. Respond with only 
                    the array of objects, and do not include the response in a code block or use backticks.`,
          },
        ],
      };

      const response: AxiosResponse = await openai.post(
        "/chat/completions",
        requestData
      );

      // Remove code block markers if present
      let content = response.data.choices[0].message.content;
      content = content.replace(/```json/g, "").replace(/```/g, "");

      return JSON.parse(content);
    } catch (error: any) {
      if (error instanceof AxiosError) {
        console.error("Error during input parsing:", error.message);
        throw new Error("Failed to parse input with OpenAI");
      }
      throw error;
    }
  };

  const generateAnswer = async (question: string) => {
    try {
      const requestData = {
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: `You are assisting the user in their study. Provide a concise and accurate answer to the following question: "${question}". Only answer the question, do not say anything other than the answer.`,
          },
        ],
      };

      const response: AxiosResponse = await openai.post(
        "/chat/completions",
        requestData
      );
      return response.data.choices[0].message.content.trim();
    } catch (error: any) {
      if (error instanceof AxiosError) {
        console.error("Error generating answer:", error.message);
        throw new Error("Failed to generate answer with OpenAI");
      }
      throw error;
    }
  };

  let parsedQuestions: Question[];

  try {
    parsedQuestions = apiCheck ? [] : await parseInput(input);
  } catch (error: any) {
    console.error(error.message);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }

  try {
    for (const q of parsedQuestions) {
      if (!q.answer) {
        q.answer = await generateAnswer(q.question);
      }
    }
  } catch (error: any) {
    console.error(error.message);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }

  try {
    return NextResponse.json(parsedQuestions);
  } catch (error: any) {
    console.error("Error returning response:", error.message);
    return NextResponse.json(
      { error: "Failed to return response" },
      { status: 500 }
    );
  }
}

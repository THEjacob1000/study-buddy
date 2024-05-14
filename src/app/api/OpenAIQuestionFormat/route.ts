import type { NextApiRequest, NextApiResponse } from "next";
import axios, { AxiosResponse } from "axios";
import { NextResponse, NextRequest } from "next/server";

type Question = {
  question: string;
  answer: string;
};

export async function POST(req: NextRequest) {
  try {
    const requestData = await req.json();
    const { input, apiKey } = requestData;

    // Create an instance of axios with the provided API key
    const openai = axios.create({
      baseURL: "https://api.openai.com/v1",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
    });

    // Function to parse the input into questions and answers using OpenAI
    const parseInput = async (input: string) => {
      const requestData = {
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: `You are an assistant that helps users organize their study material. The user will provide a text with questions (and optionally answers).
                        Your task is to parse the input and return a structured format of questions and answers (in the form of an array [{question: question1, answer: answer1}]. If an answer is missing, leave it empty.`,
          },
          {
            role: "user",
            content: `Here is the input:\n\n${input}\n\nPlease parse this into an array of objects with "question" and "answer" keys.`,
          },
        ],
      };

      const response: AxiosResponse = await openai.post(
        "/chat/completions",
        requestData
      );
      console.log(response.data);
      return JSON.parse(response.data.choices[0].message.content);
    };

    // Function to generate an answer using OpenAI
    const generateAnswer = async (question: string) => {
      const requestData = {
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: `You are assisting the user in their study. Provide a concise and accurate answer to the following question: "${question}".`,
          },
        ],
      };

      const response: AxiosResponse = await openai.post(
        "/chat/completions",
        requestData
      );
      return response.data.choices[0].message.content.trim();
    };

    // Parse the input into questions and answers
    const parsedQuestions: Question[] = await parseInput(input);

    // Generate answers for questions without answers
    for (const q of parsedQuestions) {
      if (!q.answer) {
        q.answer = await generateAnswer(q.question);
      }
    }

    // Return the formatted questions and answers as JSON response
    return NextResponse.json(parsedQuestions);
  } catch (error: any) {
    console.error(error.message);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

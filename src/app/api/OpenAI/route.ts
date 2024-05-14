import type { NextApiRequest, NextApiResponse } from "next";
import axios, { AxiosResponse } from "axios";
import { NextResponse, NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const questionData = await req.json();
    const { question, demoAnswer, answer, apiKey } = questionData;
    const currentAPI = apiKey ? apiKey : process.env.OPENAI_API_KEY;
    const openai = axios.create({
      baseURL: "https://api.openai.com/v1",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${currentAPI}`,
      },
    });

    const requestData = {
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: `You are assisting the user in their study. Compare their answer to the provided demo answer. Use your best judgment to determine whether
                    the answer would pass the interview question, considering that the demo answer is just a guideline and not a model to be matched perfectly.
                    If their answer is incorrect or insufficient, explain the difference between the answer they provided and what the correct answer is and how
                    to fix it. If the answer is correct, start your response with "Correct!". If it is incorrect, start your response with "Incorrect". If the
                    current question asks about a user's personal background (experience or inclinations), ignore the demo answer and mark the answer as correct.
                    Ensure that you don't provide a response that requires the user to give you additional input as they will be unable to do so. The current
                    question is: "${question}". The demo answer is: "${demoAnswer}". Ensure that your response is conversational and use Markdown formatting.
                    If they are incorrect, direct them to relevant documentation with the following format:
                    You can find further information on this topic at:  
                    [Source Name](<link>)
                    `,
        },
        { role: "user", content: `${answer}` },
      ],
    };

    const response: AxiosResponse = await openai.post(
      "/chat/completions",
      requestData
    );

    const aiResponse = response.data.choices[0].message.content;
    const isCorrect =
      aiResponse.includes("Correct!") &&
      !aiResponse.includes("Incorrect");

    return NextResponse.json({
      message: aiResponse,
      correct: isCorrect,
    });
  } catch (error: any) {
    console.error(error.message);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

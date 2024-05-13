import type { NextApiRequest, NextApiResponse } from "next";
import axios, { AxiosResponse } from "axios";
import { NextResponse, NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  const openai = axios.create({
    baseURL: "https://api.openai.com/v1",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
    },
  });
  const questionData = await await req.json();
  const { question, demoAnswer, answer } = questionData;
  const requestData = {
    model: "gpt-3.5-turbo",
    messages: [
      {
        role: "system",
        content: `You are assisting the user in their study. Compare their given answer to the provided demo answer. If their answer is incorrect or insufficient, explain why. The current question is: "${question}". The demo answer is: "${demoAnswer}". Ensure that you phrase your response as if you are talking directly to the user and render any formatting you'd like to use in your response as html. Additionally, if they are incorrect, try to direct them to relevant documentation; phrase it like this: <br><br>You can find further information on this topic at: <br><a href="<link>">Source Name</a>/`,
      },
      { role: "user", content: `${answer}` },
    ],
  };

  try {
    const response: AxiosResponse = await openai.post(
      "/chat/completions",
      requestData
    );
    return NextResponse.json(response.data);
  } catch (error: any) {
    console.error(error.message);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

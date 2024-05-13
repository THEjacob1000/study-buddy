"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { quizQuestions } from "@/lib/studyQuestions";
import { cn } from "@/lib/utils";

type QuizQuestion = {
  question: string;
  answer: string;
};

const QuizCard = () => {
  const [questionState, setQuestionState] = useState<
    "question" | "answer"
  >("question");
  const [currentQuestion, setCurrentQuestion] =
    useState<QuizQuestion | null>(null);
  useEffect(() => {
    const randomQuestion =
      quizQuestions[Math.floor(Math.random() * quizQuestions.length)];
    setCurrentQuestion(randomQuestion);
  }, []);

  const handleCardClick = () => {
    if (questionState === "answer") {
      const randomQuestion =
        quizQuestions[
          Math.floor(Math.random() * quizQuestions.length)
        ];
      setCurrentQuestion(randomQuestion);
    }
    setQuestionState((state) =>
      state === "question" ? "answer" : "question"
    );
  };

  if (!currentQuestion) {
    return <p>Loading...</p>;
  }

  const { question, answer } = currentQuestion;
  return (
    <Card className="hover:cursor-pointer" onClick={handleCardClick}>
      <CardHeader className="w-full flex justify-center items-center">
        <CardTitle
          className={cn(
            "my-12 mx-4 text-center",
            questionState === "question"
              ? "text-6xl text-card-foreground"
              : "text-3xl text-muted-foreground"
          )}
        >
          {questionState === "answer" ? answer : question}
        </CardTitle>
      </CardHeader>
    </Card>
  );
};

export default QuizCard;

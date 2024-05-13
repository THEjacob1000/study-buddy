"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { quizQuestions } from "@/lib/studyQuestions";
import { cn } from "@/lib/utils";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Textarea } from "./ui/textarea";
import axios from "axios";

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
  const [aiResponse, setAiResponse] = useState<string>("");
  useEffect(() => {
    const randomQuestion =
      quizQuestions[Math.floor(Math.random() * quizQuestions.length)];
    setCurrentQuestion(randomQuestion);
  }, []);
  const formSchema = z.object({
    answer: z.string().min(2),
  });
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      answer: "",
    },
  });
  const handleCardClick = () => {
    if (questionState === "answer") {
      const randomQuestion =
        quizQuestions[
          Math.floor(Math.random() * quizQuestions.length)
        ];
      setCurrentQuestion(randomQuestion);
      setQuestionState("question");
    }
  };

  if (!currentQuestion) {
    return <p>Loading...</p>;
  }
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      const response = await axios.post(
        "/api/OpenAI",
        JSON.stringify({
          question: currentQuestion.question,
          demoAnswer: currentQuestion.answer,
          answer: values.answer,
        }),
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      setAiResponse(response.data.choices[0].message.content);
      setQuestionState("answer");
    } catch (error) {
      console.error(error);
    }
  };
  const { question, answer } = currentQuestion;
  return (
    <Card
      className={
        questionState === "answer" ? "hover:cursor-pointer" : ""
      }
      onClick={handleCardClick}
    >
      <CardHeader className="w-full flex justify-center items-center">
        <CardTitle
          className={cn(
            "my-12 mx-4 text-center md:text-responsive",
            questionState === "question"
              ? "md:text-4xl text-card-foreground"
              : "md:text-3xl text-muted-foreground"
          )}
        >
          {questionState === "answer" ? aiResponse : question}
        </CardTitle>
        {questionState === "question" && (
          <CardContent className="w-full px-12 pt-20">
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="flex w-full justify-between items-end"
              >
                <FormField
                  control={form.control}
                  name="answer"
                  render={({ field }) => (
                    <FormItem className="w-full">
                      <FormLabel>Answer:</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Your answer..."
                          className="w-3/4"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit">Submit</Button>
              </form>
            </Form>
          </CardContent>
        )}
      </CardHeader>
    </Card>
  );
};

export default QuizCard;

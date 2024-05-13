"use client";

import { useEffect, useState, useCallback } from "react";
import DOMPurify from "dompurify";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { quizQuestions } from "@/lib/studyQuestions";
import { cn } from "@/lib/utils";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Textarea } from "./ui/textarea";
import axios from "axios";
import Image from "next/image";
import LoadingSpinner from "./LoadingSpinner";

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
  const [loading, setLoading] = useState<boolean>(false);

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

  const onSubmit = useCallback(
    async (values: z.infer<typeof formSchema>) => {
      setLoading(true);
      try {
        const response = await axios.post(
          "/api/OpenAI",
          {
            question: currentQuestion?.question,
            demoAnswer: currentQuestion?.answer,
            answer: values.answer,
          },
          {
            headers: {
              "Content-Type": "application/json",
            },
          }
        );
        const sanitizedResponse = DOMPurify.sanitize(
          response.data.choices[0].message.content
        );
        setAiResponse(sanitizedResponse);
        setQuestionState("answer");
        form.reset();
        setLoading(false);
      } catch (error) {
        console.error(error);
        setLoading(false);
      }
    },
    [currentQuestion, form]
  );

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.ctrlKey && event.key === "Enter") {
        event.preventDefault();
        form.handleSubmit(onSubmit)();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [form, onSubmit]);

  if (!currentQuestion) {
    return <p>Loading...</p>;
  }

  const { question } = currentQuestion;
  console.log(loading);

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
          dangerouslySetInnerHTML={{
            __html:
              questionState === "answer" ? aiResponse : question,
          }}
        />
        {questionState === "question" && (
          <CardContent className="w-full md:px-12 px-2 pt-20">
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
                {!loading ? (
                  <Button type="submit" className="w-1/3">
                    Submit (
                    <span className="bg-accent/80 text-xs p-1 mx-1">
                      Ctrl
                    </span>{" "}
                    +{" "}
                    <span className="bg-accent/80 text-xs p-1 mx-1">
                      Enter
                    </span>
                    )
                  </Button>
                ) : (
                  <Button
                    type="button"
                    disabled={true}
                    className="w-1/3"
                  >
                    <LoadingSpinner size={24} />
                  </Button>
                )}
              </form>
            </Form>
          </CardContent>
        )}
      </CardHeader>
    </Card>
  );
};

export default QuizCard;

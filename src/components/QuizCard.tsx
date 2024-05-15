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
// import { quizQuestions } from "@/lib/studyQuestions";
import { cn } from "@/lib/utils";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Textarea } from "./ui/textarea";
import axios from "axios";
import Markdown from "markdown-to-jsx";
import LoadingSpinner from "./LoadingSpinner";

type QuizQuestion = {
  question: string;
  answer: string;
  TimesCorrect: number;
};

interface QuizCardProps {
  isCompleted: boolean;
  setCompleted: (completed: boolean) => void;
}

const QuizCard = ({ setCompleted, isCompleted }: QuizCardProps) => {
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [questionState, setQuestionState] = useState<
    "question" | "answer"
  >("question");
  const [currentQuestion, setCurrentQuestion] =
    useState<QuizQuestion | null>(null);
  const [aiResponse, setAiResponse] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [correct, setCorrect] = useState<boolean>(false);
  const [localApi, setLocalApi] = useState<string | null>(null);
  const [maxQuestions, setMaxQuestions] = useState<number>(0);

  useEffect(() => {
    const storedQuestions = localStorage.getItem("quizQuestions");
    const initialQuestions = JSON.parse(storedQuestions || "[]");
    setQuestions(initialQuestions);
    setMaxQuestions(initialQuestions.length);
    setLocalApi(localStorage.getItem("api"));
  }, []);

  useEffect(() => {
    if (questions.length > 0) {
      const randomQuestion =
        questions[Math.floor(Math.random() * questions.length)];
      setCurrentQuestion(randomQuestion);
    }
  }, [questions]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      const input = document.getElementById("textInput");
      input?.focus();
    }, 100);

    return () => clearTimeout(timeoutId);
  }, [currentQuestion]);

  const formSchema = z.object({
    answer: z.string().min(2),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      answer: "",
    },
  });

  const handleCardClick = useCallback(() => {
    if (questionState === "answer") {
      const randomQuestion =
        questions[Math.floor(Math.random() * questions.length)];
      setCurrentQuestion(randomQuestion);
      setQuestionState("question");
    }
  }, [questionState, questions]);

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
            apiKey: localApi,
          },
          {
            headers: {
              "Content-Type": "application/json",
            },
          }
        );
        const sanitizedResponse = DOMPurify.sanitize(
          response.data.message
        );
        const isCorrect = response.data.correct;
        setCorrect(isCorrect);

        const updatedQuestions = questions
          .map((q) =>
            q.question === currentQuestion?.question
              ? {
                  ...q,
                  TimesCorrect: isCorrect
                    ? q.TimesCorrect + 1
                    : q.TimesCorrect,
                }
              : q
          )
          .filter((q) => q.TimesCorrect === 0);
        setQuestions(updatedQuestions);
        localStorage.setItem(
          "quizQuestions",
          JSON.stringify(updatedQuestions)
        );
        if (updatedQuestions.length <= 0) {
          localStorage.removeItem("quizQuestions");
          setCompleted(true);
        }

        setAiResponse(sanitizedResponse);
        setQuestionState("answer");
        form.reset();
        setLoading(false);
      } catch (error: any) {
        console.error(error.message);
        setLoading(false);
      }
    },
    [
      currentQuestion?.answer,
      currentQuestion?.question,
      form,
      localApi,
      questions,
      setCompleted,
    ]
  );

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (
        event.ctrlKey &&
        event.key === "Enter" &&
        questionState === "question"
      ) {
        event.preventDefault();
        form.handleSubmit(onSubmit)();
      }
      if (event.key === "Enter" && questionState === "answer") {
        handleCardClick();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [form, handleCardClick, onSubmit, questionState]);

  if (!currentQuestion) {
    return <p>Loading...</p>;
  }

  const { question } = currentQuestion;

  if (!isCompleted) {
    return (
      <>
        <h2 className="mb-6 md:mt-20 mt-6 font-xl font-semibold text-muted-foreground text-center">
          Submit your answer to the question using the textbox below,
          then click the card again for a new question
        </h2>
        <div className="md:w-1/2 w-full mt-2 md:mt-12">
          <Card
            className={cn(
              questionState === "answer"
                ? "hover:cursor-pointer"
                : "border-border",
              questionState === "answer" && correct
                ? "border-green-500"
                : questionState === "answer" &&
                    !correct &&
                    "border-destructive"
            )}
            onClick={handleCardClick}
          >
            <CardHeader className="w-full flex flex-col justify-center items-center">
              <CardTitle
                className={cn(
                  "my-12 mx-4 text-center md:text-responsive",
                  questionState === "question"
                    ? "md:text-4xl text-card-foreground"
                    : "md:text-3xl text-muted-foreground text-start"
                )}
              >
                {questionState === "answer" ? (
                  <Markdown>{aiResponse}</Markdown>
                ) : (
                  question
                )}
              </CardTitle>
              {questionState === "question" ? (
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
                                id="textInput"
                                autoFocus={false}
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
              ) : (
                <CardContent className="w-full flex justify-center items-center text-muted-foreground">
                  Click here or press Enter to continue
                </CardContent>
              )}
              <div className="w-full flex justify-between items-center text-muted-foreground">
                <div>
                  {maxQuestions - questions.length} / {maxQuestions}
                </div>
                <div>{currentQuestion.TimesCorrect} / 3</div>
              </div>
            </CardHeader>
          </Card>
        </div>
      </>
    );
  }
  return (
    <Card onClick={() => setCompleted(false)}>
      <CardHeader>
        <h2 className="text-xl font-bold">
          Congratulations! You have completed the quiz.
        </h2>
      </CardHeader>
      <CardContent className="w-full flex justify-center items-center text-muted-foreground">
        Click here or press Enter to continue
      </CardContent>
    </Card>
  );
};

export default QuizCard;

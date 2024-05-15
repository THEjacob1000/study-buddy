"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Card, CardContent, CardHeader } from "./ui/card";
import { useEffect, useState } from "react";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import Link from "next/link";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { Progress } from "./ui/progress";
import axios from "axios";
import { cn } from "@/lib/utils";

interface InitialCardProps {
  initial: boolean;
  setInitial: (initial: boolean) => void;
}

const InitialCard = ({ initial, setInitial }: InitialCardProps) => {
  const [hasKey, setHasKey] = useState<boolean>(false);
  const [localApi, setLocalApi] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [input, setInput] = useState<string>("");
  const [progress, setProgress] = useState<number>(0);
  const [apiError, setApiError] = useState<string | null>(null);

  const apiSchema = z.object({
    apiKey: z.string().min(2),
  });
  const questionsSchema = z.object({
    questionData: z.string(),
  });

  useEffect(() => {
    const storedApi = localStorage.getItem("api") || undefined;
    if (storedApi) {
      setLocalApi(storedApi);
    }
    const working = async () => {
      const test = await checkKey(storedApi);
      setApiError(null);
      // console.log("test", test);
      if (test) {
        setHasKey(true);
        const storedQuestions = localStorage.getItem("quizQuestions");
        !storedQuestions ? setInitial(true) : setInitial(false);
      }
    };
    working();
  }, [setInitial]);

  const checkKey = async (apiKey?: string) => {
    try {
      setLoading(true);
      setProgress(33);
      const response = await axios.post(
        "/api/OpenAIQuestionFormat",
        {
          input: "Test input to validate API key",
          apiKey,
          apiCheck: true,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      setProgress(66);
      if (response.status === 200) {
        // console.log("response", response);
        setHasKey(true);
        setApiError(null);
      }
      setLoading(false);
      setProgress(100);
      return true;
    } catch (error: any) {
      console.error(error);
      if (error.response && error.response.status === 401) {
        setApiError("Invalid API Key");
      } else if (
        error.response &&
        error.response.data.error === "API key is required"
      ) {
        setApiError("API Key is required");
      } else {
        setApiError(error.response.data.error);
        console.error(error.response.data.error);
      }
      setLoading(false);
      setProgress(0);
      localStorage.removeItem("api");
      setHasKey(false);
      return false;
    }
  };

  const apiForm = useForm<z.infer<typeof apiSchema>>({
    resolver: zodResolver(apiSchema),
    defaultValues: {
      apiKey: "",
    },
  });

  const questionsForm = useForm<z.infer<typeof questionsSchema>>({
    resolver: zodResolver(questionsSchema),
    defaultValues: {
      questionData: "",
    },
  });

  const onApiSubmit = async (data: z.infer<typeof apiSchema>) => {
    localStorage.setItem("api", data.apiKey);
    setLocalApi(data.apiKey);
    await checkKey(data.apiKey);
    // setInitial(true);
  };

  const onSubmit = async (data: z.infer<typeof questionsSchema>) => {
    setLoading(true);
    setProgress(33);
    if (!data.questionData && !input) {
      setLoading(false);
      setProgress(0);
      return;
    }
    try {
      // console.log("data", data, "input", input);
      const response = await axios.post(
        "/api/OpenAIQuestionFormat",
        {
          input: data.questionData || input,
          apiKey: localApi,
          apiCheck: false,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      setProgress(66);
      const responseData = response.data;
      // console.log(responseData);
      const formattedData = responseData.map((q: any) => ({
        question: q.question,
        answer: q.answer,
        TimesCorrect: 0,
      }));
      localStorage.setItem(
        "quizQuestions",
        JSON.stringify(formattedData)
      );
      localStorage.setItem("Max Questions", responseData.length);
      setProgress(100);
      setLoading(false);
      setInitial(false);
    } catch (error: any) {
      console.error(error.message);
      setLoading(false);
      setProgress(0);
    }
  };

  // console.log(
  //   "initial",
  //   initial,
  //   "hasKey",
  //   hasKey,
  //   "localApi",
  //   localApi
  // );
  if (!hasKey && initial)
    return (
      <Card className="mt-40">
        <CardHeader className="w-full flex items-center justify-center">
          <h2 className="text-xl font-bold px-12 w-3/4 text-center">
            Please Enter Your OpenAI API Key. If you do not have one,
            one can be made{" "}
            <Link
              href="https://platform.openai.com/api-keys"
              target="_blank"
            >
              here
            </Link>
          </h2>
        </CardHeader>
        <CardContent className="w-full flex justify-center items-center text-muted-foreground mt-10">
          <Form {...apiForm}>
            <form
              onSubmit={apiForm.handleSubmit(onApiSubmit)}
              className="w-full flex flex-col items-center"
            >
              <FormField
                control={apiForm.control}
                name="apiKey"
                render={({ field }) => (
                  <FormItem className="w-full flex flex-col items-center">
                    <FormLabel>API Key</FormLabel>
                    {apiError && (
                      <p className="text-red-500 mt-4 text-sm">
                        {apiError}
                      </p>
                    )}
                    <FormControl>
                      <Input
                        placeholder="Your API key..."
                        className={cn(
                          "w-1/2" && apiError && "border-border"
                        )}
                        {...field}
                        autoFocus={false}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="mt-4">
                Submit
              </Button>
              {loading && (
                <Progress value={progress} className="mt-4" />
              )}
            </form>
          </Form>
        </CardContent>
      </Card>
    );

  if (hasKey && initial)
    return (
      <Card className="mt-40">
        <CardHeader className="w-full flex items-center justify-center max-w-[50vw]">
          Please input the questions you&apos;d like to study. You can
          input multiple questions at once, separated by a new line.
          The AI will provide you with a response to each question if
          you don&apos;t provide demo answers
        </CardHeader>
        <CardContent className="w-full flex justify-center items-center text-muted-foreground mt-10">
          <Form {...questionsForm}>
            <form
              onSubmit={questionsForm.handleSubmit(onSubmit)}
              className="w-full flex flex-col items-start"
            >
              <FormField
                control={questionsForm.control}
                name="questionData"
                render={({ field }) => (
                  <FormItem className="w-full">
                    <FormLabel>Question Input:</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Your question data..."
                        className="w-full"
                        {...field}
                        id="textInput"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        autoFocus={false}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button
                type="submit"
                className="mt-4"
                disabled={loading}
              >
                {loading ? "Loading..." : "Submit"}
              </Button>
              {loading && (
                <Progress value={progress} className="mt-4" />
              )}
            </form>
          </Form>
        </CardContent>
      </Card>
    );

  return null;
};

export default InitialCard;

import type React from "react";
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
import { cn } from "@/lib/utils";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Textarea } from "./ui/textarea";
import axios from "axios";
import Markdown from "markdown-to-jsx";
import { Loader2 } from "lucide-react";
import { Progress } from "./ui/progress";

type QuizQuestion = {
	id: number;
	question: string;
	answer: string;
	timesCorrect: number;
	completed: boolean;
};

interface QuizCardProps {
	documentId: number;
	questionStreak: number;
	onComplete: () => void;
}

const QuizCard: React.FC<QuizCardProps> = ({
	documentId,
	questionStreak,
	onComplete,
}) => {
	const [questions, setQuestions] = useState<QuizQuestion[]>([]);
	const [questionState, setQuestionState] = useState<"question" | "answer">(
		"question",
	);
	const [currentQuestion, setCurrentQuestion] = useState<QuizQuestion | null>(
		null,
	);
	const [aiResponse, setAiResponse] = useState<string>("");
	const [loading, setLoading] = useState<boolean>(false);
	const [initialLoading, setInitialLoading] = useState<boolean>(true);
	const [correct, setCorrect] = useState<boolean>(false);
	const [progress, setProgress] = useState<{
		completed: number;
		total: number;
	}>({ completed: 0, total: 0 });

	const fetchQuestions = useCallback(async () => {
		try {
			setInitialLoading(true);
			const response = await axios.get(
				`/api/questions?documentId=${documentId}`,
			);
			const questionsData = response.data.questions;

			// Filter out completed questions based on streak requirement
			const activeQuestions = questionsData.filter(
				(q: QuizQuestion) => q.timesCorrect < questionStreak,
			);

			setQuestions(activeQuestions);
			setProgress({
				completed: response.data.completedQuestions,
				total: response.data.totalQuestions,
			});

			if (activeQuestions.length === 0) {
				onComplete();
			} else {
				// Select a random question
				const randomQuestion =
					activeQuestions[Math.floor(Math.random() * activeQuestions.length)];
				setCurrentQuestion(randomQuestion);
			}

			setInitialLoading(false);
		} catch (error) {
			console.error("Error fetching questions:", error);
			setInitialLoading(false);
		}
	}, [documentId, questionStreak, onComplete]);

	useEffect(() => {
		fetchQuestions();
	}, [fetchQuestions]);

	const formSchema = z.object({
		answer: z.string().min(2, "Please provide an answer"),
	});

	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			answer: "",
		},
	});

	const handleCardClick = useCallback(() => {
		if (questionState === "answer" && questions.length > 0) {
			// Select a new random question
			const randomQuestion =
				questions[Math.floor(Math.random() * questions.length)] ?? null;
			setCurrentQuestion(randomQuestion);
			setQuestionState("question");
			form.reset();
		}
	}, [questionState, questions, form]);

	const onSubmit = useCallback(
		async (values: z.infer<typeof formSchema>) => {
			if (!currentQuestion) return;

			setLoading(true);
			try {
				const response = await axios.post("/api/evaluate", {
					questionId: currentQuestion.id,
					answer: values.answer,
				});

				const sanitizedResponse = DOMPurify.sanitize(response.data.message);
				const isCorrect = response.data.correct;
				setCorrect(isCorrect);

				// Update local state to reflect the change
				if (isCorrect) {
					setQuestions((prev) =>
						prev
							.map((q) =>
								q.id === currentQuestion.id
									? {
											...q,
											timesCorrect: q.timesCorrect + 1,
											completed: q.timesCorrect + 1 >= questionStreak,
										}
									: q,
							)
							.filter((q) => q.timesCorrect < questionStreak),
					);

					// Update progress
					if (currentQuestion.timesCorrect + 1 >= questionStreak) {
						setProgress((prev) => ({
							...prev,
							completed: prev.completed + 1,
						}));
					}
				}

				setAiResponse(sanitizedResponse);
				setQuestionState("answer");
				form.reset();

				// Check if all questions are completed
				if (
					questions.length <= 1 &&
					isCorrect &&
					currentQuestion.timesCorrect + 1 >= questionStreak
				) {
					setTimeout(() => onComplete(), 2000);
				}
			} catch (error) {
				console.error("Error evaluating answer:", error);
			} finally {
				setLoading(false);
			}
		},
		[currentQuestion, form, questionStreak, questions.length, onComplete],
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

	if (initialLoading) {
		return (
			<div className="flex flex-col items-center justify-center h-64">
				<Loader2 className="h-12 w-12 animate-spin text-primary" />
				<p className="mt-4 text-muted-foreground">Loading questions...</p>
			</div>
		);
	}

	if (!currentQuestion) {
		return (
			<Card>
				<CardHeader>
					<CardTitle className="text-center">
						All questions completed!
					</CardTitle>
				</CardHeader>
				<CardContent className="text-center">
					<p className="text-muted-foreground">
						You've completed all the questions for this document.
					</p>
					<Button onClick={onComplete} className="mt-4">
						Back to Dashboard
					</Button>
				</CardContent>
			</Card>
		);
	}

	const completionPercentage = (progress.completed / progress.total) * 100;

	return (
		<>
			<h2 className="mb-6 md:mt-10 mt-6 font-xl font-semibold text-muted-foreground text-center">
				Submit your answer to the question below, then click the card again for
				a new question
			</h2>

			<div className="w-full flex flex-col items-center mb-4">
				<div className="w-full max-w-3xl flex items-center gap-2">
					<Progress value={completionPercentage} className="h-2" />
					<span className="text-sm text-muted-foreground whitespace-nowrap">
						{progress.completed}/{progress.total}
					</span>
				</div>
			</div>

			<div className="md:w-2/3 w-full mt-2">
				<Card
					className={cn(
						questionState === "answer"
							? "hover:cursor-pointer"
							: "border-border",
						questionState === "answer" && correct
							? "border-green-500"
							: questionState === "answer" && !correct && "border-destructive",
					)}
					onClick={handleCardClick}
				>
					<CardHeader className="w-full flex flex-col justify-center items-center">
						<CardTitle
							className={cn(
								"my-8 mx-4 text-center md:text-responsive w-full md:px-12 px-2",
								questionState === "question"
									? "md:text-3xl text-card-foreground text-start"
									: "md:text-2xl text-muted-foreground text-start",
							)}
						>
							{questionState === "answer" ? (
								<Markdown>{aiResponse}</Markdown>
							) : (
								currentQuestion.question
							)}
						</CardTitle>
						{questionState === "question" ? (
							<CardContent className="w-full md:px-12 px-2 pt-12">
								<Form {...form}>
									<form
										onSubmit={form.handleSubmit(onSubmit)}
										className="flex w-full md:justify-between items-end flex-wrap gap-4"
									>
										<FormField
											control={form.control}
											name="answer"
											render={({ field }) => (
												<FormItem className="w-full">
													<FormLabel>Your Answer:</FormLabel>
													<FormControl>
														<Textarea
															placeholder="Type your answer here..."
															className="w-full min-h-[120px]"
															{...field}
															id="textInput"
															autoFocus={true}
														/>
													</FormControl>
													<FormMessage />
												</FormItem>
											)}
										/>
										{!loading ? (
											<Button type="submit" className="w-1/3 min-w-fit">
												Submit (
												<span className="dark:bg-accent/80 bg-accent/30 text-xs p-1 mx-1">
													Ctrl
												</span>{" "}
												+{" "}
												<span className="dark:bg-accent/80 bg-accent/30 text-xs p-1 mx-1">
													Enter
												</span>
												)
											</Button>
										) : (
											<Button type="button" disabled={true} className="w-1/3">
												<Loader2 className="animate-spin" size={24} />
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
						<div className="w-full flex justify-between items-center text-muted-foreground px-6 pb-6">
							<div>
								Question {progress.completed + 1} of {progress.total}
							</div>
							<div>
								Progress: {currentQuestion.timesCorrect} / {questionStreak}
							</div>
						</div>
					</CardHeader>
				</Card>
			</div>
		</>
	);
};

export default QuizCard;

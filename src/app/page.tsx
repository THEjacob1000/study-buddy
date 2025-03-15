"use client";

import Options from "@/components/Options";
import QuizCard from "@/components/QuizCard";
import InitialCard from "@/components/initialCard";
import { useEffect, useState } from "react";

export default function Home() {
	const [completed, setCompleted] = useState<boolean>(false);
	const [initial, setInitial] = useState<boolean>(false);
	const [isLocal, setIsLocal] = useState<boolean>(false);
	const [hasQuestions, setHasQuestions] = useState<boolean>(false);
	const [questionStreak, setQuestionStreak] = useState<number>(1);

	useEffect(() => {
		const storedQuestions = localStorage.getItem("quizQuestions");
		storedQuestions ? setInitial(false) : setInitial(true);
		storedQuestions ? setHasQuestions(true) : setHasQuestions(false);
		localStorage.getItem("api") ? setIsLocal(true) : setIsLocal(false);
	}, []);

	return (
		<div className="w-full flex flex-col items-center justify-center py-4 px-4 md:px-12">
			<div className="w-full flex justify-between items-center px-4 md:px-20">
				<h1 className="font-bold text-2xl">Developer Pro Study Buddy</h1>
				<Options
					hasQuestions={hasQuestions}
					isLocal={isLocal}
					setHasQuestions={setHasQuestions}
					setInitial={setInitial}
					setIsLocal={setIsLocal}
					questionStreak={questionStreak}
					setQuestionStreak={setQuestionStreak}
				/>
			</div>
			{!initial ? (
				<QuizCard
					isCompleted={completed}
					setCompleted={setCompleted}
					questionStreak={questionStreak}
				/>
			) : (
				<InitialCard initial={initial} setInitial={setInitial} />
			)}
		</div>
	);
}

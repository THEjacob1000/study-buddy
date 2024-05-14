"use client";

import { ModeToggle } from "@/components/ModeToggle";
import QuizCard from "@/components/QuizCard";
import { useEffect, useState } from "react";

export default function Home() {
  const [completed, setCompleted] = useState<boolean>(false);
  const [initial, setInitial] = useState<boolean>(false);
  useEffect(() => {
    const storedQuestions = localStorage.getItem("quizQuestions");
    storedQuestions ? setInitial(true) : setInitial(false);
  }, [initial]);
  return (
    <div className="w-full flex flex-col items-center justify-center py-4 px-4 md:px-12">
      <div className="w-full flex justify-between items-center px-4 md:px-20">
        <h1 className="font-bold text-2xl">
          Developer Pro Study Buddy
        </h1>
        <ModeToggle />
      </div>
      <QuizCard isCompleted={completed} setCompleted={setCompleted} />
    </div>
  );
}

"use client";

import { ModeToggle } from "@/components/ModeToggle";
import QuizCard from "@/components/QuizCard";
import InitialCard from "@/components/initialCard";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function Home() {
  const [completed, setCompleted] = useState<boolean>(false);
  const [initial, setInitial] = useState<boolean>(false);
  const [isLocal, setIsLocal] = useState<boolean>(false);
  const [hasQuestions, setHasQuestions] = useState<boolean>(false);
  const router = useRouter();
  useEffect(() => {
    const storedQuestions = localStorage.getItem("quizQuestions");
    !storedQuestions ? setInitial(true) : setInitial(false);
    storedQuestions ? setHasQuestions(true) : setHasQuestions(false);
    localStorage.getItem("api")
      ? setIsLocal(true)
      : setIsLocal(false);
  }, [initial, isLocal]);

  const removeLocalKey = () => {
    localStorage.removeItem("api");
    setIsLocal(false);
    setInitial(false);
    router.refresh();
  };

  const removeLocalQuestions = () => {
    localStorage.removeItem("quizQuestions");
    setHasQuestions(false);
    router.refresh();
  };

  return (
    <div className="w-full flex flex-col items-center justify-center py-4 px-4 md:px-12">
      <div className="w-full flex justify-between items-center px-4 md:px-20">
        <h1 className="font-bold text-2xl">
          Developer Pro Study Buddy
        </h1>
        <div className="flex gap-4 items-center">
          <ModeToggle />
          <div className="flex flex-col gap-2 items-center justify-center">
            {isLocal && (
              <Button variant={"outline"} onClick={removeLocalKey}>
                Remove Locally Stored API Key
              </Button>
            )}
            {hasQuestions && (
              <Button variant={"outline"} onClick={removeLocalKey}>
                Remove Locally Stored Question Data
              </Button>
            )}
          </div>
        </div>
      </div>
      {!initial ? (
        <QuizCard
          isCompleted={completed}
          setCompleted={setCompleted}
        />
      ) : (
        <InitialCard initial={initial} setInitial={setInitial} />
      )}
    </div>
  );
}

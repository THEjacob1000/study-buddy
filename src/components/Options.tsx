"use client";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Menu } from "lucide-react";
import { useRouter } from "next/navigation";
import ModeSwitch from "./ModeSwitch";
import { Button } from "./ui/button";

interface OptionsProps {
  isLocal: boolean;
  setIsLocal: (isLocal: boolean) => void;
  setInitial: (initial: boolean) => void;
  hasQuestions: boolean;
  setHasQuestions: (hasQuestions: boolean) => void;
  questionStreak: number;
  setQuestionStreak: (questionStreak: number) => void;
}

const Options = ({
  isLocal,
  setIsLocal,
  setInitial,
  setHasQuestions,
  hasQuestions,
  questionStreak,
  setQuestionStreak,
}: OptionsProps) => {
  const router = useRouter();
  const removeLocalKey = () => {
    localStorage.removeItem("api");
    setIsLocal(false);
    router.refresh();
  };

  const removeLocalQuestions = () => {
    localStorage.removeItem("quizQuestions");
    localStorage.removeItem("Max Questions");
    setHasQuestions(false);
    setInitial(true);
    router.refresh();
  };
  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <Menu size={32} />
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuLabel>Options</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          disabled={!isLocal}
          onClick={removeLocalKey}
        >
          Remove Locally Stored API Key
        </DropdownMenuItem>
        <DropdownMenuItem
          disabled={!hasQuestions}
          onClick={removeLocalQuestions}
        >
          Remove Locally Stored Question Data
        </DropdownMenuItem>
        <DropdownMenuItem
          className="flex justify-between"
          onSelect={(e) => e.preventDefault()}
        >
          Question Streak:{" "}
          <div className="flex gap-2 items-center">
            <Button
              variant={"ghost"}
              className="w-fit rounded-full"
              size={"sm"}
              disabled={questionStreak <= 1}
              onClick={() => setQuestionStreak(questionStreak - 1)}
            >
              -
            </Button>
            {questionStreak}
            <Button
              variant={"ghost"}
              size={"sm"}
              className="w-fit rounded-full"
              onClick={() => setQuestionStreak(questionStreak + 1)}
            >
              +
            </Button>
          </div>
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
          <ModeSwitch />
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default Options;

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

interface OptionsProps {
  isLocal: boolean;
  setIsLocal: (isLocal: boolean) => void;
  setInitial: (initial: boolean) => void;
  hasQuestions: boolean;
  setHasQuestions: (hasQuestions: boolean) => void;
}

const Options = ({
  isLocal,
  setIsLocal,
  setInitial,
  setHasQuestions,
  hasQuestions,
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
        <DropdownMenuItem>
          <ModeSwitch />
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default Options;

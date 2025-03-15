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
import { Button } from "./ui/button";

interface OptionsProps {
	questionStreak: number;
	setQuestionStreak: (questionStreak: number) => void;
}

const Options = ({ questionStreak, setQuestionStreak }: OptionsProps) => {
	const router = useRouter();

	return (
		<DropdownMenu>
			<DropdownMenuTrigger>
				<Menu size={28} />
			</DropdownMenuTrigger>
			<DropdownMenuContent>
				<DropdownMenuLabel>Options</DropdownMenuLabel>
				<DropdownMenuSeparator />
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
				<DropdownMenuSeparator />
				<DropdownMenuItem onClick={() => router.refresh()}>
					Refresh
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);
};

export default Options;

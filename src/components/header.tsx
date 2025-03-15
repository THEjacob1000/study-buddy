"use client";

import { ModeToggle } from "@/components/ModeToggle";
import Options from "@/components/options";
import { UserButton } from "@clerk/nextjs";

interface HeaderProps {
	questionStreak: number;
	setQuestionStreak: (streak: number) => void;
}

export default function Header({
	questionStreak,
	setQuestionStreak,
}: HeaderProps) {
	return (
		<header className="w-full flex justify-between items-center px-4 md:px-20 mb-8">
			<h1 className="font-bold text-2xl">Study Buddy</h1>
			<div className="flex items-center gap-4">
				<ModeToggle />
				<Options
					questionStreak={questionStreak}
					setQuestionStreak={setQuestionStreak}
				/>
				<UserButton afterSignOutUrl="/sign-in" />
			</div>
		</header>
	);
}

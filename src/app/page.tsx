import { ModeToggle } from "@/components/ModeToggle";
import QuizCard from "@/components/QuizCard";

export default function Home() {
  return (
    <div className="w-full flex flex-col items-center justify-center py-4 px-12">
      <div className="w-full flex justify-between items-center px-20">
        <h1 className="font-bold text-2xl">Study Buddy</h1>
        <ModeToggle />
      </div>
      <h2 className="my-12 font-xl font-semibold text-muted-foreground">
        Click the question when you think you have the answer, then
        click the card again for a new question
      </h2>
      <div className="w-1/2 mt-12">
        <QuizCard />
      </div>
    </div>
  );
}

import { ModeToggle } from "@/components/ModeToggle";
import QuizCard from "@/components/QuizCard";

export default function Home() {
  return (
    <div className="w-full flex flex-col items-center justify-center py-4 px-4 md:px-12">
      <div className="w-full flex justify-between items-center px-4 md:px-20">
        <h1 className="font-bold text-2xl">
          Developer Pro Study Buddy
        </h1>
        <ModeToggle />
      </div>
      <h2 className="mb-6 md:mt-20 mt-6 font-xl font-semibold text-muted-foreground text-center">
        Submit your answer to the question using the textbox below,
        then click the card again for a new question
      </h2>
      <div className="md:w-1/2 w-full mt-2 md:mt-12">
        <QuizCard />
      </div>
    </div>
  );
}

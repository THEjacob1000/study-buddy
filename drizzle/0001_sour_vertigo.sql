ALTER TABLE "question_progress" DROP COLUMN "times_correct";

ALTER TABLE "question_progress" ADD COLUMN "times_correct" integer DEFAULT 0;
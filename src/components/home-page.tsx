"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import QuizCard from "@/components/quiz-card";
import DocumentUpload from "@/components/document-upload";
import DocumentList from "@/components/document-list";
import { Button } from "@/components/ui/button";
import { FileText, Plus } from "lucide-react";
import { client } from "@/lib/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import Header from "@/components/header";

type Document = {
	id: string;
	title: string;
	createdAt: string;
	questionsCount: number;
	completedCount: number;
};

export default function HomePage() {
	const [view, setView] = useState<"documents" | "upload" | "quiz">(
		"documents",
	);
	const [selectedDocumentId, setSelectedDocumentId] = useState<string | null>(
		null,
	);
	const [questionStreak, setQuestionStreak] = useState<number>(3);
	const queryClient = useQueryClient();

	// Use React Query for fetching documents
	const { data, isLoading, error } = useQuery({
		queryKey: ["documents"],
		queryFn: async () => {
			const response = await client.document.getDocuments.$get();
			return response.json();
		},
	});

	const documents = data?.documents || [];

	const handleDocumentSelect = (documentId: string) => {
		setSelectedDocumentId(documentId);
		setView("quiz");
	};

	const handleUploadSuccess = (documentId: string) => {
		// Invalidate documents query to refresh the list
		queryClient.invalidateQueries({ queryKey: ["documents"] });
		setSelectedDocumentId(documentId);
		setView("quiz");
	};

	const handleQuizComplete = () => {
		// Invalidate documents query to get updated progress
		queryClient.invalidateQueries({ queryKey: ["documents"] });
		setView("documents");
	};

	return (
		<div className="w-full flex flex-col items-center py-4 px-4 md:px-12">
			<Header
				questionStreak={questionStreak}
				setQuestionStreak={setQuestionStreak}
			/>

			<main className="w-full max-w-5xl">
				{view === "documents" && (
					<>
						<div className="flex justify-between items-center mb-6">
							<h2 className="text-xl font-semibold">Your Study Materials</h2>
							<Button onClick={() => setView("upload")}>
								<Plus className="mr-2 h-4 w-4" />
								Add New
							</Button>
						</div>

						<DocumentList
							documents={documents}
							isLoading={isLoading}
							onSelect={handleDocumentSelect}
							onRefresh={() =>
								queryClient.invalidateQueries({ queryKey: ["documents"] })
							}
						/>

						{documents.length === 0 && !isLoading && (
							<Card className="mt-8">
								<CardHeader>
									<CardTitle className="text-center">Get Started</CardTitle>
								</CardHeader>
								<CardContent className="flex flex-col items-center">
									<FileText className="h-16 w-16 text-muted-foreground mb-4" />
									<p className="text-center text-muted-foreground mb-4">
										You don't have any study materials yet. Upload a PDF or text
										file to get started.
									</p>
									<Button onClick={() => setView("upload")}>
										<Plus className="mr-2 h-4 w-4" />
										Add Study Material
									</Button>
								</CardContent>
							</Card>
						)}
					</>
				)}

				{view === "upload" && (
					<DocumentUpload onUploadSuccess={handleUploadSuccess} />
				)}

				{view === "quiz" && selectedDocumentId && (
					<QuizCard
						documentId={selectedDocumentId}
						questionStreak={questionStreak}
						onComplete={handleQuizComplete}
					/>
				)}
			</main>
		</div>
	);
}

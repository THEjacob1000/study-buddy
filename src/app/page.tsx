"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Options from "@/components/options";
import QuizCard from "@/components/quiz-card";
import DocumentUpload from "@/components/document-upload";
import DocumentList from "@/components/document-list";
import { ModeToggle } from "@/components/ModeToggle";
import { Button } from "@/components/ui/button";
import { FileText, Plus } from "lucide-react";
import axios from "axios";

type Document = {
	id: number;
	title: string;
	createdAt: string;
	questionsCount: number;
	completedCount: number;
};

export default function Home() {
	const [view, setView] = useState<"documents" | "upload" | "quiz">(
		"documents",
	);
	const [documents, setDocuments] = useState<Document[]>([]);
	const [selectedDocumentId, setSelectedDocumentId] = useState<number | null>(
		null,
	);
	const [questionStreak, setQuestionStreak] = useState<number>(3);
	const [isLoading, setIsLoading] = useState<boolean>(true);

	useEffect(() => {
		fetchDocuments();
	}, []);

	const fetchDocuments = async () => {
		try {
			setIsLoading(true);
			const response = await axios.get("/api/documents");
			setDocuments(response.data.documents);
			setIsLoading(false);
		} catch (error) {
			console.error("Error fetching documents:", error);
			setIsLoading(false);
		}
	};

	const handleDocumentSelect = (documentId: number) => {
		setSelectedDocumentId(documentId);
		setView("quiz");
	};

	const handleUploadSuccess = (documentId: number) => {
		fetchDocuments();
		setSelectedDocumentId(documentId);
		setView("quiz");
	};

	const handleQuizComplete = () => {
		fetchDocuments();
		setView("documents");
	};

	return (
		<div className="w-full flex flex-col items-center py-4 px-4 md:px-12">
			<header className="w-full flex justify-between items-center px-4 md:px-20 mb-8">
				<h1 className="font-bold text-2xl">Study Buddy</h1>
				<div className="flex items-center gap-4">
					<ModeToggle />
					<Options
						questionStreak={questionStreak}
						setQuestionStreak={setQuestionStreak}
					/>
				</div>
			</header>

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
							onRefresh={fetchDocuments}
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

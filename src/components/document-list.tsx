import type React from "react";
import {
	Card,
	CardContent,
	CardFooter,
	CardHeader,
	CardTitle,
} from "./ui/card";
import { Button } from "./ui/button";
import { Progress } from "./ui/progress";
import { FileText, Loader2, Trash } from "lucide-react";
import { client } from "@/lib/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";

type Document = {
	id: string;
	title: string;
	createdAt: string;
	questionsCount: number;
	completedCount: number;
};

interface DocumentListProps {
	documents: Document[];
	isLoading: boolean;
	onSelect: (documentId: string) => void;
	onRefresh: () => void;
}

const DocumentList: React.FC<DocumentListProps> = ({
	documents,
	isLoading,
	onSelect,
	onRefresh,
}) => {
	const queryClient = useQueryClient();

	// Use React Query mutation for deleting documents
	const { mutate: deleteDocument, isPending: isDeleting } = useMutation({
		mutationFn: async (documentId: string) => {
			return await client.document.deleteDocument
				.$post({
					documentId,
				})
				.then((res) => res.json());
		},
		onSuccess: () => {
			// Invalidate documents query to refresh the list
			queryClient.invalidateQueries({ queryKey: ["documents"] });
			onRefresh();
		},
	});

	const handleDeleteDocument = async (documentId: string) => {
		if (window.confirm("Are you sure you want to delete this document?")) {
			deleteDocument(documentId);
		}
	};

	if (isLoading) {
		return (
			<div className="flex justify-center items-center py-12">
				<Loader2 className="h-8 w-8 animate-spin text-primary" />
			</div>
		);
	}

	if (documents.length === 0) {
		return null;
	}

	return (
		<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
			{documents.map((doc) => {
				const completionPercentage =
					doc.questionsCount > 0
						? (doc.completedCount / doc.questionsCount) * 100
						: 0;

				return (
					<Card key={doc.id} className="flex flex-col">
						<CardHeader>
							<CardTitle className="truncate">{doc.title}</CardTitle>
							<p className="text-sm text-muted-foreground">
								{new Date(doc.createdAt).toLocaleDateString()}
							</p>
						</CardHeader>
						<CardContent className="flex-grow">
							<div className="space-y-2">
								<div className="flex justify-between text-sm">
									<span>Progress</span>
									<span>
										{doc.completedCount}/{doc.questionsCount} complete
									</span>
								</div>
								<Progress value={completionPercentage} />
							</div>
						</CardContent>
						<CardFooter className="flex justify-between">
							<Button
								variant="outline"
								size="sm"
								onClick={() => handleDeleteDocument(doc.id)}
								disabled={isDeleting}
							>
								{isDeleting ? (
									<Loader2 className="h-4 w-4 animate-spin" />
								) : (
									<Trash className="h-4 w-4" />
								)}
							</Button>
							<Button onClick={() => onSelect(doc.id)}>
								<FileText className="mr-2 h-4 w-4" />
								Study
							</Button>
						</CardFooter>
					</Card>
				);
			})}
		</div>
	);
};

export default DocumentList;

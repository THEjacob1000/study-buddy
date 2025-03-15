import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { client } from "@/lib/client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { File, FileText, Loader2, Upload } from "lucide-react";
import { useRouter } from "next/navigation";
import type React from "react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import { Progress } from "./ui/progress";
import { Textarea } from "./ui/textarea";

interface DocumentUploadProps {
	onUploadSuccess: (documentId: string) => void;
}

const formSchema = z.object({
	title: z.string().min(1, "Title is required"),
	uploadType: z.enum(["file", "text"]),
	textContent: z
		.string()
		.optional()
		.or(z.string().min(1, "Content is required")),
});

const DocumentUpload: React.FC<DocumentUploadProps> = ({ onUploadSuccess }) => {
	const [file, setFile] = useState<File | null>(null);
	const [progress, setProgress] = useState<number>(0);

	const router = useRouter();

	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			title: "",
			uploadType: "file",
			textContent: "",
		},
	});

	const uploadType = form.watch("uploadType");

	const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		if (e.target.files?.[0]) {
			setFile(e.target.files[0]);
		}
	};

	const {
		mutate: onSubmit,
		error,
		isPending: isUploading,
	} = useMutation({
		mutationKey: ["document", "upload"],
		mutationFn: async (values: z.infer<typeof formSchema>) => {
			setProgress(10);
			if (values.uploadType === "file" && !file) {
				throw new Error("Please select a file to upload");
			}
			if (
				values.uploadType === "text" &&
				(!values.textContent || values.textContent.trim() === "")
			) {
				throw new Error("Please enter some text content");
			}

			setProgress(30);
			const response = await client.document.upload
				.$post({
					textContent: values.textContent ?? null,
					title: values.title,
					file,
				})
				.then((res) => res.json());
			setProgress(80);
			return response;
		},
		onSuccess(data) {
			setProgress(100);
			onUploadSuccess(data.document.id);
		},
	});

	return (
		<Card className="w-full max-w-3xl mx-auto">
			<CardHeader>
				<CardTitle className="text-center">Upload Study Material</CardTitle>
			</CardHeader>
			<CardContent>
				<Form {...form}>
					<form
						onSubmit={form.handleSubmit((values) => onSubmit(values))}
						className="space-y-6"
					>
						<FormField
							control={form.control}
							name="title"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Document Title</FormLabel>
									<FormControl>
										<Input
											placeholder="Enter a title for your document"
											{...field}
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						<FormField
							control={form.control}
							name="uploadType"
							render={({ field }) => (
								<FormItem>
									<div className="flex space-x-4">
										<Button
											type="button"
											variant={field.value === "file" ? "default" : "outline"}
											onClick={() => {
												field.onChange("file");
											}}
											className="flex-1"
										>
											<FileText className="mr-2 h-4 w-4" />
											Upload File
										</Button>
										<Button
											type="button"
											variant={field.value === "text" ? "default" : "outline"}
											onClick={() => {
												field.onChange("text");
											}}
											className="flex-1"
										>
											<File className="mr-2 h-4 w-4" />
											Enter Text
										</Button>
									</div>
								</FormItem>
							)}
						/>

						{uploadType === "file" ? (
							<div className="border-2 border-dashed rounded-md p-6 text-center">
								<input
									type="file"
									id="fileUpload"
									accept=".pdf,.txt,.md"
									onChange={handleFileChange}
									className="hidden"
								/>
								<label
									htmlFor="fileUpload"
									className="cursor-pointer block w-full text-center"
								>
									<Upload className="mx-auto h-12 w-12 text-muted-foreground" />
									<p className="mt-2 text-sm text-muted-foreground">
										{file
											? file.name
											: "Drag and drop a file here, or click to browse"}
									</p>
									<p className="mt-1 text-xs text-muted-foreground">
										Supported formats: PDF, TXT, MD
									</p>
								</label>
							</div>
						) : (
							<FormField
								control={form.control}
								name="textContent"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Content</FormLabel>
										<FormControl>
											<Textarea
												placeholder="Paste your study material here..."
												className="min-h-[200px]"
												{...field}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
						)}

						{error && (
							<p className="text-destructive text-sm">{error.message}</p>
						)}

						<Button type="submit" className="w-full" disabled={isUploading}>
							{isUploading ? (
								<span className="flex items-center">
									<Loader2 className="mr-2 h-4 w-4 animate-spin" />
									Processing...
								</span>
							) : (
								"Upload & Generate Questions"
							)}
						</Button>

						{isUploading && (
							<div className="space-y-2">
								<Progress value={progress} />
								<p className="text-xs text-center text-muted-foreground">
									{progress < 30 && "Preparing upload..."}
									{progress >= 30 && progress < 70 && "Uploading document..."}
									{progress >= 70 && progress < 90 && "Generating questions..."}
									{progress >= 90 && "Finalizing..."}
								</p>
							</div>
						)}
					</form>
				</Form>
			</CardContent>
		</Card>
	);
};

export default DocumentUpload;

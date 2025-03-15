// LoginForm.tsx
"use client";

import { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/lib/auth-context";

const formSchema = z.object({
	email: z.string().email("Please enter a valid email address"),
});

export default function LoginForm() {
	const { login } = useAuth();
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			email: "",
		},
	});

	async function onSubmit(values: z.infer<typeof formSchema>) {
		setIsLoading(true);
		setError(null);

		try {
			await login(values.email);
		} catch (err) {
			setError("Failed to login. Please try again.");
			console.error(err);
		} finally {
			setIsLoading(false);
		}
	}

	return (
		<Card className="w-full max-w-md mx-auto">
			<CardHeader>
				<CardTitle>Welcome to Study Buddy</CardTitle>
				<CardDescription>
					Enter your email to sign in or create an account
				</CardDescription>
			</CardHeader>
			<CardContent>
				<Form {...form}>
					<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
						<FormField
							control={form.control}
							name="email"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Email</FormLabel>
									<FormControl>
										<Input
											placeholder="your.email@example.com"
											{...field}
											type="email"
											autoComplete="email"
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						{error && <p className="text-destructive text-sm">{error}</p>}

						<Button type="submit" className="w-full" disabled={isLoading}>
							{isLoading ? (
								<span className="flex items-center">
									<Loader2 className="mr-2 h-4 w-4 animate-spin" />
									Signing in...
								</span>
							) : (
								"Continue with Email"
							)}
						</Button>
					</form>
				</Form>
			</CardContent>
		</Card>
	);
}

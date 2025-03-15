import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { TanStackQueryProvider } from "@/lib/query-provider";
import { ClerkProvider } from "@clerk/nextjs";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
	title: "Study Buddy - AI-powered Flashcards",
	description: "Study with AI-generated flashcards from your own materials",
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en">
			<body className={inter.className}>
				<ClerkProvider>
					<TanStackQueryProvider>
						<ThemeProvider attribute="class" defaultTheme="system">
							<div className="w-screen flex flex-col items-center">
								{children}
							</div>
						</ThemeProvider>
					</TanStackQueryProvider>
				</ClerkProvider>
			</body>
		</html>
	);
}

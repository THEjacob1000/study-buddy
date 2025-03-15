// src/app/sign-in/[[...sign-in]]/page.tsx
import { SignIn } from "@clerk/nextjs";

export default function Page() {
	return (
		<div className="flex justify-center items-center min-h-screen bg-background">
			<SignIn
				appearance={{
					elements: {
						rootBox: "mx-auto",
						card: "bg-card border border-border shadow-sm",
						formButtonPrimary:
							"bg-primary text-primary-foreground hover:bg-primary/90",
					},
				}}
			/>
		</div>
	);
}

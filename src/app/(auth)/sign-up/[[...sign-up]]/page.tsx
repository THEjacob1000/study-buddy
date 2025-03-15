import { SignUp } from "@clerk/nextjs";

export default function Page() {
	return (
		<div className="flex justify-center items-center min-h-screen bg-background">
			<SignUp
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

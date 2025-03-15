// AuthWrapper.tsx
"use client";

import { useAuth } from "@/lib/auth-context";
import LoginForm from "@/components/auth/login-form";
import { Loader2 } from "lucide-react";

interface AuthWrapperProps {
	children: React.ReactNode;
}

export default function AuthWrapper({ children }: AuthWrapperProps) {
	const { user, loading } = useAuth();

	if (loading) {
		return (
			<div className="flex justify-center items-center h-screen">
				<Loader2 className="h-8 w-8 animate-spin text-primary" />
			</div>
		);
	}

	if (!user) {
		return (
			<div className="flex justify-center items-center min-h-screen p-4">
				<LoginForm />
			</div>
		);
	}

	return <>{children}</>;
}

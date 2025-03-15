"use client";

import type React from "react";
import { createContext, useContext, useState, useEffect } from "react";
import { client } from "@/lib/client";

interface User {
	id: string;
	email: string;
	name: string | null;
}

interface AuthContextType {
	user: User | null;
	loading: boolean;
	login: (email: string) => Promise<void>;
	logout: () => void;
}

// Create context with a default value
const AuthContext = createContext<AuthContextType>({
	user: null,
	loading: true,
	login: async () => {},
	logout: () => {},
});

// Custom hook to use auth context
export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
	children,
}) => {
	const [user, setUser] = useState<User | null>(null);
	const [loading, setLoading] = useState(true);

	// Check if user is already logged in
	useEffect(() => {
		const checkUser = async () => {
			try {
				// In a real app, this would validate a session token or similar
				const userFromStorage = localStorage.getItem("studyBuddyUser");

				if (userFromStorage) {
					const parsedUser = JSON.parse(userFromStorage);
					setUser(parsedUser);
				}
			} catch (error) {
				console.error("Error checking auth status:", error);
			} finally {
				setLoading(false);
			}
		};

		checkUser();
	}, []);

	// Login function - simplified for this app
	const login = async (email: string) => {
		setLoading(true);
		try {
			// In a real app, you would make an API call to authenticate
			// For now, we'll create a demo user
			const response = await client.auth.login
				.$post({
					email,
				})
				.then((res) => res.json());

			const newUser = response.user;
			setUser(newUser);
			localStorage.setItem("studyBuddyUser", JSON.stringify(newUser));
		} catch (error) {
			console.error("Login error:", error);
			throw error;
		} finally {
			setLoading(false);
		}
	};

	// Logout function
	const logout = () => {
		setUser(null);
		localStorage.removeItem("studyBuddyUser");
	};

	return (
		<AuthContext.Provider value={{ user, loading, login, logout }}>
			{children}
		</AuthContext.Provider>
	);
};

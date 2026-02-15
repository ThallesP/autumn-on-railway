import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import { CustomToaster } from "@/components/general/CustomToaster";
import { IconButton } from "@/components/v2/buttons/IconButton";
import { Input } from "@/components/v2/inputs/Input";
import { authClient, useSession } from "@/lib/auth-client";
import { emailRegex } from "../SignIn";

export const PasswordSignIn = () => {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [name, setName] = useState("");
	const [isSignUp, setIsSignUp] = useState(false);
	const [loading, setLoading] = useState(false);
	const { data: session } = useSession();
	const navigate = useNavigate();

	useEffect(() => {
		if (session?.user) {
			navigate("/sandbox/products?tab=products");
		}
	}, [session, navigate]);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!email || !emailRegex.test(email)) {
			toast.error("Please enter a valid email address.");
			return;
		}
		if (!password || password.length < 8) {
			toast.error("Password must be at least 8 characters.");
			return;
		}
		if (isSignUp && !name.trim()) {
			toast.error("Please enter your name.");
			return;
		}

		setLoading(true);

		try {
			if (isSignUp) {
				const { error } = await authClient.signUp.email({
					email,
					password,
					name: name.trim(),
				});

				if (error) {
					toast.error(error.message || "Failed to create account.");
				} else {
					navigate("/sandbox/products?tab=products");
				}
			} else {
				const { error } = await authClient.signIn.email({
					email,
					password,
				});

				if (error) {
					toast.error(error.message || "Invalid email or password.");
				} else {
					navigate("/sandbox/products?tab=products");
				}
			}
		} catch {
			toast.error("Something went wrong. Please try again.");
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="w-screen h-screen bg-background flex items-center justify-center p-4">
			<CustomToaster />
			<div className="w-full max-w-[350px] space-y-4">
				{/* Logo */}
				<div className="flex justify-center">
					<img src="/logo_hd.png" alt="Autumn" className="w-12 h-12" />
				</div>

				{/* Title */}
				<div className="text-center">
					<h1 className="text-lg font-semibold text-foreground">
						{isSignUp ? "Create an account" : "Sign in to Autumn"}
					</h1>
				</div>

				<form onSubmit={handleSubmit} className="space-y-4">
					<div className="space-y-2">
						{isSignUp && (
							<Input
								type="text"
								placeholder="Name"
								value={name}
								onChange={(e) => setName(e.target.value)}
								required
								className="text-base"
								autoComplete="name"
							/>
						)}
						<Input
							type="email"
							placeholder="Email"
							value={email}
							onChange={(e) => setEmail(e.target.value)}
							required
							className="text-base"
							autoComplete="email"
						/>
						<Input
							type="password"
							placeholder="Password"
							value={password}
							onChange={(e) => setPassword(e.target.value)}
							required
							className="text-base"
							autoComplete={isSignUp ? "new-password" : "current-password"}
						/>
					</div>

					<IconButton
						type="submit"
						variant="primary"
						isLoading={loading}
						className="w-full"
					>
						{isSignUp ? "Create account" : "Sign in"}
					</IconButton>
				</form>

				<div className="text-center">
					<button
						type="button"
						onClick={() => setIsSignUp(!isSignUp)}
						className="text-sm text-t3 hover:text-t2 hover:underline"
					>
						{isSignUp
							? "Already have an account? Sign in"
							: "Don't have an account? Sign up"}
					</button>
				</div>
			</div>
		</div>
	);
};

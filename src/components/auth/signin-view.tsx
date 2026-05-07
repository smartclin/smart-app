// src/features/auth/components/sign-in-view.tsx
import { useNavigate } from "@tanstack/react-router";
import { Eye, EyeOff, Heart } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authClient } from "@/lib/auth-client";

export default function SignInViewPage() {
	const navigate = useNavigate();
	const [isLoading, setIsLoading] = useState(false);
	const [showPassword, setShowPassword] = useState(false);
	const [formData, setFormData] = useState({
		email: "",
		password: ""
	});

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setIsLoading(true);

		try {
			const result = await authClient.signIn.email({
				email: formData.email,
				password: formData.password,
				callbackURL: "/dashboard"
			});

			if (result.error) {
				toast.error(result.error.message || "Invalid email or password");
				return;
			}

			toast.success("Welcome back!");
			navigate({ to: "/dashboard" });
		} catch (error) {
			console.error("Sign in error:", error);
			toast.error("An unexpected error occurred. Please try again.");
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<Card className='border-0 shadow-none lg:border lg:shadow-sm'>
			<CardHeader className='space-y-2 text-center'>
				<div className='mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-teal-100 lg:hidden'>
					<Heart className='h-6 w-6 text-teal-600' />
				</div>
				<CardTitle className='font-bold text-2xl'>Welcome back</CardTitle>
				<CardDescription>Sign in to your account to manage your child's health</CardDescription>
			</CardHeader>

			<form onSubmit={handleSubmit}>
				<CardContent className='space-y-4'>
					<div className='space-y-2'>
						<Label htmlFor='email'>Email</Label>
						<Input
							autoComplete='email'
							id='email'
							onChange={e => setFormData({ ...formData, email: e.target.value })}
							placeholder='parent@example.com'
							required
							type='email'
							value={formData.email}
						/>
					</div>

					<div className='space-y-2'>
						<Label htmlFor='password'>Password</Label>
						<div className='relative'>
							<Input
								autoComplete='current-password'
								id='password'
								onChange={e => setFormData({ ...formData, password: e.target.value })}
								placeholder='••••••••'
								required
								type={showPassword ? "text" : "password"}
								value={formData.password}
							/>
							<button
								className='absolute top-1/2 right-3 -translate-y-1/2 text-gray-500 hover:text-gray-700'
								onClick={() => setShowPassword(!showPassword)}
								type='button'
							>
								{showPassword ? <EyeOff className='h-4 w-4' /> : <Eye className='h-4 w-4' />}
							</button>
						</div>
					</div>

					<div className='flex items-center justify-between'>
						<label className='flex items-center gap-2 text-sm'>
							<input
								className='rounded border-gray-300'
								type='checkbox'
							/>
							<span className='text-gray-600'>Remember me</span>
						</label>
						<button
							className='text-sm text-teal-600 hover:underline'
							onClick={() => navigate({ to: "/auth/forgot-password" })}
							type='button'
						>
							Forgot password?
						</button>
					</div>
				</CardContent>

				<CardFooter className='flex flex-col gap-4'>
					<Button
						className='w-full'
						disabled={isLoading}
						type='submit'
					>
						{isLoading ? (
							<span className='flex items-center gap-2'>
								<span className='h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent' />
								Signing in...
							</span>
						) : (
							"Sign In"
						)}
					</Button>

					<p className='text-center text-gray-600 text-sm'>
						Don't have an account?{" "}
						<button
							className='font-medium text-teal-600 hover:underline'
							onClick={() => navigate({ to: "/auth/sign-up" })}
							type='button'
						>
							Create an account
						</button>
					</p>

					{/* Optional: Demo credentials for testing */}
					<div className='mt-4 rounded-lg bg-gray-50 p-3 text-center'>
						<p className='text-gray-500 text-xs'>Demo Credentials</p>
						<p className='mt-1 text-gray-400 text-xs'>
							Email: demo@smartclinic.com
							<br />
							Password: demo123
						</p>
					</div>
				</CardFooter>
			</form>
		</Card>
	);
}

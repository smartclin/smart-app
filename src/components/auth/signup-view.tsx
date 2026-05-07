// src/features/auth/components/sign-up-view.tsx
import { useNavigate } from "@tanstack/react-router";
import { Eye, EyeOff, User } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authClient } from "@/lib/auth-client";

const signUpSchema = z
	.object({
		name: z.string().min(2, "Name must be at least 2 characters"),
		email: z.string().email("Invalid email address"),
		password: z.string().min(6, "Password must be at least 6 characters"),
		confirmPassword: z.string()
	})
	.refine(data => data.password === data.confirmPassword, {
		message: "Passwords don't match",
		path: ["confirmPassword"]
	});

type SignUpFormData = {
	name: string;
	email: string;
	password: string;
	confirmPassword: string;
	role?: "parent" | "doctor" | "staff";
	inviteCode?: string;
};

export default function SignUpViewPage() {
	const navigate = useNavigate();
	const [isLoading, setIsLoading] = useState(false);
	const [showPassword, setShowPassword] = useState(false);
	const [showConfirmPassword, setShowConfirmPassword] = useState(false);
	const [formData, setFormData] = useState<SignUpFormData>({
		name: "",
		email: "",
		password: "",
		confirmPassword: "",
		role: "parent"
	});
	const [errors, setErrors] = useState<Record<string, string>>({});

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setIsLoading(true);
		setErrors({});

		// Validate form
		const result = signUpSchema.safeParse(formData);
		if (!result.success) {
			const fieldErrors: Record<string, string> = {};
			result.error.issues.forEach(issue => {
				if (issue.path[0]) {
					fieldErrors[issue.path[0] as string] = issue.message;
				}
			});
			setErrors(fieldErrors);
			setIsLoading(false);
			return;
		}

		try {
			const { confirmPassword, ...signUpData } = formData;

			const { data, error } = await authClient.signUp.email({
				email: signUpData.email,
				password: signUpData.password,
				name: signUpData.name,
				// role and inviteCode are not standard signUp fields
				// Use callbackURL to redirect after sign up
				callbackURL: "/auth/sign-in"
			});

			if (error) {
				toast.error(error.message || "Failed to create account");
				return;
			}

			if (data) toast.success("Account created successfully! Please sign in.");
			navigate({ to: "/auth/sign-in" });
		} catch (error) {
			console.error("Sign up error:", error);
			toast.error("An unexpected error occurred. Please try again.");
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<Card className='border-0 shadow-none lg:border lg:shadow-sm'>
			<CardHeader className='space-y-2 text-center'>
				<CardTitle className='font-bold text-2xl'>Create an account</CardTitle>
				<CardDescription>Join Smart Clinic to manage your child's healthcare journey</CardDescription>
			</CardHeader>

			<form onSubmit={handleSubmit}>
				<CardContent className='space-y-4'>
					<div className='space-y-2'>
						<Label htmlFor='name'>Full Name</Label>
						<div className='relative'>
							<User className='absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400' />
							<Input
								className='pl-10'
								id='name'
								onChange={e => setFormData({ ...formData, name: e.target.value })}
								placeholder='John Doe'
								required
								value={formData.name}
							/>
						</div>
						{errors.name && <p className='text-red-500 text-sm'>{errors.name}</p>}
					</div>

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
						{errors.email && <p className='text-red-500 text-sm'>{errors.email}</p>}
					</div>

					<div className='space-y-2'>
						<Label htmlFor='password'>Password</Label>
						<div className='relative'>
							<Input
								autoComplete='new-password'
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
						{errors.password && <p className='text-red-500 text-sm'>{errors.password}</p>}
					</div>

					<div className='space-y-2'>
						<Label htmlFor='confirmPassword'>Confirm Password</Label>
						<div className='relative'>
							<Input
								id='confirmPassword'
								onChange={e => setFormData({ ...formData, confirmPassword: e.target.value })}
								placeholder='••••••••'
								required
								type={showConfirmPassword ? "text" : "password"}
								value={formData.confirmPassword}
							/>
							<button
								className='absolute top-1/2 right-3 -translate-y-1/2 text-gray-500 hover:text-gray-700'
								onClick={() => setShowConfirmPassword(!showConfirmPassword)}
								type='button'
							>
								{showConfirmPassword ? <EyeOff className='h-4 w-4' /> : <Eye className='h-4 w-4' />}
							</button>
						</div>
						{errors.confirmPassword && <p className='text-red-500 text-sm'>{errors.confirmPassword}</p>}
					</div>

					{/* Optional: Invite code for staff/doctors */}
					{formData.role !== "parent" && (
						<div className='space-y-2'>
							<Label htmlFor='inviteCode'>Invite Code</Label>
							<Input
								id='inviteCode'
								onChange={e => setFormData({ ...formData, inviteCode: e.target.value })}
								placeholder='Enter your invite code'
								value={formData.inviteCode}
							/>
							<p className='text-gray-500 text-xs'>
								Staff and doctors require an invite code to register
							</p>
						</div>
					)}
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
								Creating account...
							</span>
						) : (
							"Create Account"
						)}
					</Button>

					<p className='text-center text-gray-600 text-sm'>
						Already have an account?{" "}
						<button
							className='font-medium text-teal-600 hover:underline'
							onClick={() => navigate({ to: "/auth/sign-in" })}
							type='button'
						>
							Sign in
						</button>
					</p>

					<p className='text-center text-gray-400 text-xs'>
						By creating an account, you agree to our{" "}
						<button
							className='text-teal-600 hover:underline'
							type='button'
						>
							Terms of Service
						</button>{" "}
						and{" "}
						<button
							className='text-teal-600 hover:underline'
							type='button'
						>
							Privacy Policy
						</button>
					</p>
				</CardFooter>
			</form>
		</Card>
	);
}

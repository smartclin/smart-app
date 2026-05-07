import { createFileRoute, redirect } from "@tanstack/react-router";
import { Bell, Lock, Save, Shield, User } from "lucide-react";

import { SentryTestButton } from "@/components/SentryTestButton";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getSession } from "@/lib/auth-functions";
export const Route = createFileRoute("/dashboard/settings")({
	beforeLoad: async () => {
		const session = await getSession();
		if (!session) {
			throw redirect({ to: "/auth/sign-in", search: { redirect: "/dashboard" } });
		}
	},
	component: RouteComponent
});
function RouteComponent() {
	return (
		<div className='mx-auto max-w-6xl p-6'>
			<div className='mb-8'>
				<h1 className='font-bold text-3xl'>Settings</h1>
				<p className='text-muted-foreground'>Manage your clinic preferences and account security.</p>
			</div>
			<Tabs
				className='space-y-6'
				defaultValue='profile'
			>
				<TabsList className='grid h-auto w-full grid-cols-2 p-1 lg:grid-cols-4'>
					<TabsTrigger
						className='py-2'
						value='profile'
					>
						<User className='mr-2 h-4 w-4' /> Profile
					</TabsTrigger>
					<TabsTrigger
						className='py-2'
						value='notifications'
					>
						<Bell className='mr-2 h-4 w-4' /> Notifications
					</TabsTrigger>
					<TabsTrigger
						className='py-2'
						value='security'
					>
						<Lock className='mr-2 h-4 w-4' /> Security
					</TabsTrigger>
					<TabsTrigger
						className='py-2'
						value='system'
					>
						<Shield className='mr-2 h-4 w-4' /> System
					</TabsTrigger>
				</TabsList>
				<TabsContent value='profile'>
					<Card>
						<CardHeader>
							<CardTitle>Clinic Profile</CardTitle>
							<CardDescription>Update your clinic's public information.</CardDescription>
						</CardHeader>
						<CardContent className='space-y-4'>
							<div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
								<div className='space-y-2'>
									<Label htmlFor='clinicName'>Clinic Name</Label>
									<Input
										defaultValue='Smart Clinic Pediatrics'
										id='clinicName'
									/>
								</div>
								<div className='space-y-2'>
									<Label htmlFor='email'>Contact Email</Label>
									<Input
										defaultValue='admin@smartclinic.com'
										id='email'
										type='email'
									/>
								</div>
								<div className='space-y-2'>
									<Label htmlFor='phone'>Phone Number</Label>
									<Input
										defaultValue='+1 (555) 123-4567'
										id='phone'
									/>
								</div>
								<div className='space-y-2'>
									<Label htmlFor='address'>Address</Label>
									<Input
										defaultValue='123 Medical Center Dr, Suite 100'
										id='address'
									/>
								</div>
							</div>
							<Button className='mt-4'>
								<Save className='mr-2 h-4 w-4' /> Save Changes
							</Button>
						</CardContent>
					</Card>
				</TabsContent>
				<TabsContent value='notifications'>
					<Card>
						<CardHeader>
							<CardTitle>Notification Preferences</CardTitle>
							<CardDescription>Control how you receive alerts and reminders.</CardDescription>
						</CardHeader>
						<CardContent className='space-y-6'>
							<div className='flex items-center justify-between'>
								<div className='space-y-0.5'>
									<Label>Appointment Reminders</Label>
									<p className='text-muted-foreground text-sm'>
										Send automated SMS/Email to patients.
									</p>
								</div>
								<Switch defaultChecked />
							</div>
							<Separator />
							<div className='flex items-center justify-between'>
								<div className='space-y-0.5'>
									<Label>Immunization Alerts</Label>
									<p className='text-muted-foreground text-sm'>Notify staff when vaccines are due.</p>
								</div>
								<Switch defaultChecked />
							</div>
							<Separator />
							<div className='flex items-center justify-between'>
								<div className='space-y-0.5'>
									<Label>Weekly Analytics Report</Label>
									<p className='text-muted-foreground text-sm'>
										Receive a summary of clinic performance.
									</p>
								</div>
								<Switch />
							</div>
						</CardContent>
					</Card>
				</TabsContent>

				<TabsContent value='security'>
					<Card>
						<CardHeader>
							<CardTitle>Security Settings</CardTitle>
							<CardDescription>Manage passwords and HIPAA compliance settings.</CardDescription>
						</CardHeader>
						<CardContent className='space-y-4'>
							<div className='space-y-2'>
								<Label>Two-Factor Authentication</Label>
								<Button
									className='w-full md:w-auto'
									variant='outline'
								>
									Enable 2FA
								</Button>
							</div>
							<Separator />
							<div className='space-y-2'>
								<Label>Session Timeout</Label>
								<Select defaultValue='30'>
									<SelectTrigger className='w-45'>
										<SelectValue placeholder='Select timeout' />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value='15'>15 minutes</SelectItem>
										<SelectItem value='30'>30 minutes</SelectItem>
										<SelectItem value='60'>1 hour</SelectItem>
									</SelectContent>
								</Select>
							</div>
						</CardContent>
					</Card>
				</TabsContent>

				<TabsContent value='system'>
					<div className='grid gap-6'>
						<Card>
							<CardHeader>
								<CardTitle>System Diagnostics</CardTitle>
								<CardDescription>Tools for developers and system administrators.</CardDescription>
							</CardHeader>
							<CardContent>
								<SentryTestButton />
							</CardContent>
						</Card>
						<Card className='border-destructive/50'>
							<CardHeader>
								<CardTitle className='text-destructive'>Danger Zone</CardTitle>
							</CardHeader>
							<CardContent>
								<Button variant='destructive'>Purge Cache & Re-index Database</Button>
							</CardContent>
						</Card>
					</div>
				</TabsContent>
			</Tabs>
		</div>
	);
}

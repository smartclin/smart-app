import { useMutation, useQuery } from "@tanstack/react-query";
import { createFileRoute, redirect } from "@tanstack/react-router";
import { useState } from "react";
import { CartesianGrid, Legend, Line, LineChart, Tooltip, XAxis, YAxis } from "recharts";
import { toast } from "sonner";

import { Button } from "#/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "#/components/ui/card";
import { Input } from "#/components/ui/input";
import { Label } from "#/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "#/components/ui/tabs";
import { orpc } from "#/orpc/client";
import { getSession } from "@/lib/auth-functions";

export const Route = createFileRoute("/dashboard/growth")({
	beforeLoad: async () => {
		const session = await getSession();
		if (!session) {
			throw redirect({ to: "/auth/sign-in", search: { redirect: "/dashboard" } });
		}
	},
	component: GrowthTrackerPage
});

function GrowthTrackerPage() {
	const { patientId } = Route.useParams() as { patientId: string };

	const { data: growthData } = useQuery(
		orpc.growth.getChart.queryOptions({
			input: {
				patientId,
				measurementType: "WEIGHT"
			}
		})
	);

	const { data: percentile } = useQuery(
		orpc.growth.getPercentile.queryOptions({
			input: { patientId }
		})
	);

	return (
		<div className='p-6'>
			<h1 className='mb-6 font-bold text-2xl'>Growth Tracking</h1>

			{/* Growth Percentile Display */}
			<div className='mb-6 grid grid-cols-1 gap-4 md:grid-cols-4'>
				<Card>
					<CardHeader className='pb-2'>
						<CardTitle className='text-sm'>Weight-for-Age</CardTitle>
					</CardHeader>
					<CardContent>
						<div className='font-bold text-2xl'>
							{percentile?.classifications?.weight?.classification?.replace(/_/g, " ")}
						</div>
						<p className='text-gray-500 text-xs'>
							Z-Score: {percentile?.classifications?.weight?.zScore?.toFixed(2) || "—"}
						</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className='pb-2'>
						<CardTitle className='text-sm'>Height-for-Age</CardTitle>
					</CardHeader>
					<CardContent>
						<div className='font-bold text-2xl'>
							{percentile?.classifications?.height?.classification?.replace(/_/g, " ")}
						</div>
						<p className='text-gray-500 text-xs'>
							Z-Score: {percentile?.classifications?.height?.zScore?.toFixed(2) || "—"}
						</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className='pb-2'>
						<CardTitle className='text-sm'>BMI-for-Age</CardTitle>
					</CardHeader>
					<CardContent>
						<div className='font-bold text-2xl'>
							{percentile?.classifications?.bmi?.classification?.replace(/_/g, " ")}
						</div>
						<p className='text-gray-500 text-xs'>
							Z-Score: {percentile?.classifications?.bmi?.zScore?.toFixed(2) || "—"}
						</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className='pb-2'>
						<CardTitle className='text-sm'>Age</CardTitle>
					</CardHeader>
					<CardContent>
						<div className='font-bold text-2xl'>{percentile?.ageMonths} months</div>
						<p className='text-gray-500 text-xs'>({percentile?.ageDays} days)</p>
					</CardContent>
				</Card>
			</div>

			{/* Growth Charts */}
			<Tabs
				className='mt-6'
				defaultValue='weight'
			>
				<TabsList>
					<TabsTrigger value='weight'>Weight</TabsTrigger>
					<TabsTrigger value='height'>Height</TabsTrigger>
					<TabsTrigger value='head'>Head Circumference</TabsTrigger>
					<TabsTrigger value='bmi'>BMI</TabsTrigger>
				</TabsList>

				<TabsContent value='weight'>
					<Card>
						<CardHeader>
							<CardTitle>Weight-for-Age Chart</CardTitle>
						</CardHeader>
						<CardContent>
							<LineChart
								data={growthData}
								height={400}
								width={800}
							>
								<CartesianGrid strokeDasharray='3 3' />
								<XAxis dataKey='date' />
								<YAxis label={{ value: "Weight (kg)", angle: -90, position: "insideLeft" }} />
								<Tooltip />
								<Legend />
								<Line
									dataKey='value'
									name='Weight'
									stroke='#8884d8'
									type='monotone'
								/>
							</LineChart>
						</CardContent>
					</Card>
				</TabsContent>

				<TabsContent value='height'>
					<Card>
						<CardHeader>
							<CardTitle>Height-for-Age Chart</CardTitle>
						</CardHeader>
						<CardContent>
							<LineChart
								data={growthData}
								height={400}
								width={800}
							>
								<CartesianGrid strokeDasharray='3 3' />
								<XAxis dataKey='date' />
								<YAxis label={{ value: "Height (cm)", angle: -90, position: "insideLeft" }} />
								<Tooltip />
								<Legend />
								<Line
									dataKey='value'
									name='Height'
									stroke='#82ca9d'
									type='monotone'
								/>
							</LineChart>
						</CardContent>
					</Card>
				</TabsContent>
			</Tabs>

			{/* Add Growth Measurement Form */}
			<AddGrowthMeasurement patientId={patientId} />
		</div>
	);
}

function AddGrowthMeasurement({ patientId }: { patientId: string }) {
	const [weight, setWeight] = useState("");
	const [height, setHeight] = useState("");

	const recordGrowth = useMutation(
		orpc.growth.record.mutationOptions({
			onSuccess: () => {
				setWeight("");
				setHeight("");
				toast.success("Growth recorded successfully!");
			}
		})
	);

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		recordGrowth.mutate({
			patientId,
			weight: weight ? Number.parseFloat(weight) : undefined,
			height: height ? Number.parseFloat(height) : undefined,
			date: new Date()
		});
	};

	return (
		<Card className='mt-6'>
			<CardHeader>
				<CardTitle>Record New Measurement</CardTitle>
			</CardHeader>
			<CardContent>
				<form
					className='flex gap-4'
					onSubmit={handleSubmit}
				>
					<div className='flex-1'>
						<Label htmlFor='weight'>Weight (kg)</Label>
						<Input
							className='w-full rounded border p-2'
							id='weight'
							onChange={e => setWeight(e.target.value)}
							placeholder='e.g., 7.5'
							step='0.1'
							type='number'
							value={weight}
						/>
					</div>
					<div className='flex-1'>
						<Label htmlFor='height'>Height (cm)</Label>
						<Input
							className='w-full rounded border p-2'
							id='height'
							onChange={e => setHeight(e.target.value)}
							placeholder='e.g., 68.5'
							step='0.5'
							type='number'
							value={height}
						/>
					</div>
					<div className='flex items-end'>
						<Button
							disabled={recordGrowth.isPending}
							type='submit'
						>
							{recordGrowth.isPending ? "Saving..." : "Save"}
						</Button>
					</div>
				</form>
			</CardContent>
		</Card>
	);
}

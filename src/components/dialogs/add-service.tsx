'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { Plus } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import type { z } from 'zod'

import { ServicesSchema } from '@/lib/schema'
import { trpc } from '@/trpc/react'

import { CustomInput } from '../custom-input'
import { Button } from '../ui/button'
import { CardDescription, CardHeader } from '../ui/card'
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from '../ui/dialog'
import { Form } from '../ui/form'

export const AddService = () => {
	const [isLoading, setIsLoading] = useState(false)
	const router = useRouter()

	const form = useForm<z.infer<typeof ServicesSchema>>({
		resolver: zodResolver(ServicesSchema),
		defaultValues: {
			serviceName: '',
			price: 0,
			description: '',
		},
	})

	const addService = trpc.admin.addService.useMutation({
		onSuccess: data => {
			toast.success(data.msg)
			router.refresh()
			form.reset()
			setIsLoading(false)
		},
		onError: error => {
			console.error(error)
			toast.error(error.message || 'Something went wrong. Please try again.')
			setIsLoading(false)
		},
	})

	const onSubmit = (values: z.infer<typeof ServicesSchema>) => {
		setIsLoading(true)
		addService.mutate({
			...values,
			price: Number(values.price),
		})
	}

	return (
		<Dialog>
			<DialogTrigger asChild>
				<Button
					className="font-normal text-sm"
					size="sm"
				>
					<Plus
						className="text-gray-500"
						size={22}
					/>{' '}
					Add New Service
				</Button>
			</DialogTrigger>
			<DialogContent>
				<CardHeader className="px-0">
					<DialogTitle>Add New Service</DialogTitle>
					<CardDescription>
						Ensure accurate data entry as this may affect diagnostics and other medical processes.
					</CardDescription>
				</CardHeader>

				<Form {...form}>
					<form
						className="space-y-8"
						onSubmit={form.handleSubmit(onSubmit)}
					>
						<CustomInput
							control={form.control}
							label="Service Name"
							name="serviceName"
							placeholder="Enter service name"
							type="input"
						/>

						<CustomInput
							control={form.control}
							label="Service Price"
							name="price"
							placeholder="Enter price"
							type="input"
						/>

						<CustomInput
							control={form.control}
							label="Service Description"
							name="description"
							placeholder="Optional description"
							type="textarea"
						/>

						<Button
							className="w-full bg-blue-600"
							disabled={isLoading}
							type="submit"
						>
							{isLoading ? 'Submitting...' : 'Submit'}
						</Button>
					</form>
				</Form>
			</DialogContent>
		</Dialog>
	)
}

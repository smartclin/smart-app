import { Badge } from "./ui/badge";

export function getStatusBadge(status: string | null, isActive: boolean) {
	const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
		ACTIVE: "default",
		INACTIVE: "secondary",
		DORMANT: "outline"
	};
	if (!isActive) {
		return <Badge variant='secondary'>Inactive</Badge>;
	}

	switch (status) {
		case "ACTIVE":
			return (
				<Badge
					className='bg-green-500'
					variant='default'
				>
					Active
				</Badge>
			);
		case "DORMANT":
			return <Badge variant='outline'>Dormant</Badge>;
		default:
			return <Badge variant={(status && variants[status]) || "default"}>Active</Badge>;
	}
}

export function getBloodGroupBadge(bloodGroup: string | null) {
	if (!bloodGroup) return <span className='text-gray-400'>—</span>;

	const colors: Record<string, string> = {
		"A+": "bg-red-100 text-red-700",
		"A-": "bg-red-50 text-red-600",
		"B+": "bg-blue-100 text-blue-700",
		"B-": "bg-blue-50 text-blue-600",
		"O+": "bg-green-100 text-green-700",
		"O-": "bg-green-50 text-green-600",
		"AB+": "bg-purple-100 text-purple-700",
		"AB-": "bg-purple-50 text-purple-600"
	};

	return (
		<span
			className={`rounded-full px-2 py-0.5 font-medium text-xs ${colors[bloodGroup] || "bg-gray-100 text-gray-700"}`}
		>
			{bloodGroup}
		</span>
	);
}

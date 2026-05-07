// src/config/nav-config.ts
// Navigation configuration for the sidebar and Cmd+K bar.
// All URLs must match actual TanStack Router route paths.
import type { NavGroup } from "#/types";

export const navGroups: NavGroup[] = [
	{
		label: "Clinic",
		items: [
			{
				title: "Dashboard",
				url: "/dashboard",
				icon: "dashboard",
				isActive: false,
				shortcut: ["d", "d"],
				items: []
			},
			{
				title: "Patients",
				url: "/dashboard/patients",
				icon: "teams",
				shortcut: ["p", "p"],
				isActive: false,
				items: []
			},
			{
				title: "Appointments",
				url: "/dashboard/appointments",
				icon: "calendar",
				shortcut: ["a", "a"],
				isActive: false,
				items: []
			},
			{
				title: "Medical Records",
				url: "/dashboard/records",
				icon: "forms",
				shortcut: ["r", "r"],
				isActive: false,
				items: []
			},
			{
				title: "Immunizations",
				url: "/dashboard/immunizations",
				icon: "product",
				shortcut: ["i", "i"],
				isActive: false,
				items: []
			},
			{
				title: "Prescriptions",
				url: "/dashboard/prescriptions",
				icon: "code",
				shortcut: ["x", "x"],
				isActive: false,
				items: []
			},
			{
				title: "Growth Tracking",
				url: "/dashboard/growth",
				icon: "charts",
				shortcut: ["g", "g"],
				isActive: false,
				items: []
			},
			{
				title: "Billing",
				url: "/dashboard/billing",
				icon: "billing",
				shortcut: ["b", "b"],
				isActive: false,
				items: []
			}
		]
	},
	{
		label: "Admin",
		items: [
			{
				title: "Users",
				url: "/dashboard/users",
				icon: "account",
				shortcut: ["u", "u"],
				isActive: false,
				items: []
			},
			{
				title: "Settings",
				url: "/dashboard/settings",
				icon: "settings",
				shortcut: ["s", "s"],
				isActive: false,
				items: []
			}
		]
	}
];

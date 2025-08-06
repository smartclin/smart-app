import z from 'zod'

// 1. Define strict user role union
export type UserRole = 'admin' | 'doctor' | 'staff' | 'patient'

// 2. Route-based access control
//    Fix: use `readonly UserRole[]` instead of `string[]` in type
type RouteAccessProps = {
	[key: string]: readonly UserRole[]
}
export const AFTER_LOGIN = '/profile'
export const AFTER_REGISTER = '/profile'
export const PUBLIC_ROUTES = ['/', '/api/uploadthing', '/reset-password']
export const AUTH_ROUTES = ['/signin', '/signup', '/reset-password']

export const routeAccess: RouteAccessProps = {
	'/admin(.*)': ['admin'],
	'/patient(.*)': ['patient', 'admin', 'doctor', 'staff'],
	'/doctor(.*)': ['doctor'],
	'/staff(.*)': ['staff'],
	'/record/users': ['admin'],
	'/record/doctors': ['admin'],
	'/record/doctors(.*)': ['admin', 'doctor'],
	'/record/staffs': ['admin', 'doctor'],
	'/record/patients': ['admin', 'doctor', 'staff'],
	'/patient/registrations': ['patient'],
} as const satisfies RouteAccessProps

export const matchers = Object.entries(routeAccess).map(([pattern, allowedRoles]) => ({
    pattern: new RegExp(`^${pattern}`), // Ensure patterns are robust regex
    allowedRoles,
}));

 
// Type guard for user roles
export function isValidUserRole(role: unknown): role is UserRole {
    return ['admin', 'doctor', 'nurse', 'patient'].includes(role as string);
}
// 3. Define paths schema
const PathsSchema = z.object({
	auth: z.object({
		signIn: z.string(),
		signUp: z.string(),
		forgotPassword: z.string(),
		resetPassword: z.string(),
		twoFactor: z.string(),
	}),
	app: z.object({
		home: z.string(),
		account: z.string(),
		security: z.string(),
	}),
	admin: z.object({
		root: z.string(),
		users: z.string(),
	}),
	doctor: z.object({
		root: z.string(),
	}),
	patient: z.object({
		root: z.string(),
		newPatient: z.string(),
		patientId: z.string(),
	}),
	record: z.object({
		appointments: z.string(),
		billing: z.string(),
		doctors: z.string(),
		staffs: z.string(),
		users: z.string(),
		medical_records: z.string(),
	}),
})

// 4. Typed and validated path config
const pathsConfig = PathsSchema.parse({
	auth: {
		signIn: '/auth/signin',
		signUp: '/auth/signup',
		forgotPassword: '/auth/forgot-password',
		resetPassword: '/auth/reset-password',
		twoFactor: '/auth/two-factor',
	},
	app: {
		home: '/home',
		account: '/home/account',
		security: '/home/security',
	},
	admin: {
		root: '/admin',
		users: '/admin/users',
	},
	doctor: {
		root: '/doctor',
	},
	patient: {
		root: '/patient',
		newPatient: '/patient/registration',
		patientId: '/patient/[patientId]',
	},
	record: {
		appointments: '/record/appointments',
		billing: '/record/billing',
		doctors: '/record/doctors',
		staffs: '/record/staffs',
		users: '/record/users',
		medical_records: '/record/medical_records',
	},
})

export default pathsConfig

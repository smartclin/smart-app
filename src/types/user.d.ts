export interface User {
	id: string
	email: string
	name: string
	role: UserRole
	isEmailVerified: boolean
	avatar?: string
	createdAt: Date
	updatedAt: Date
}

export enum UserRole {
	DOCTOR = 'doctor',
	PATIENT = 'patient',
	ADMIN = 'admin',
	STAFF = 'staff',
}

export interface Professional extends User {
	bio?: string
	experience: number // años de experiencia
	rating: number
	reviewCount: number
	isVerified: boolean
	specialties: string[]
	availability: Availability[]
	location: Location
}

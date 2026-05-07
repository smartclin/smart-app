import { and, eq } from "drizzle-orm";

import { db } from "../db";
import { whoGrowthStandard } from "../db/schema";

// Helper functions
export function calculateAgeInMonths(birthDate: Date, date: Date): number {
	const months = (date.getFullYear() - birthDate.getFullYear()) * 12;
	return months + (date.getMonth() - birthDate.getMonth());
}

export function calculateAgeInDays(birthDate: Date, date: Date): number {
	return Math.floor((date.getTime() - birthDate.getTime()) / (1000 * 60 * 60 * 24));
}

export async function getWHOStandard(ageDays: number, gender: string, type: string) {
	return await db.query.whoGrowthStandard.findFirst({
		where: and(
			eq(whoGrowthStandard.ageDays, ageDays),
			eq(whoGrowthStandard.gender, gender),
			eq(whoGrowthStandard.measurementType, type)
		)
	});
}

export function calculateZScore(value: number, m: number, l: number, s: number): number {
	if (l === 0) {
		return Math.log(value / m) / s;
	}
	return ((value / m) ** l - 1) / (l * s);
}

export type GrowthRecordMeasurement = {
	weight?: number | null;
	height?: number | null;
	bmi?: number | null;
	headCircumference?: number | null;
	weightForAgeZ?: number | null;
	heightForAgeZ?: number | null;
	bmiForAgeZ?: number | null;
};

export function getMeasurementValue(record: GrowthRecordMeasurement, type: string): number | null {
	switch (type) {
		case "WEIGHT":
			return record.weight ?? null;
		case "HEIGHT":
			return record.height ?? null;
		case "BMI":
			return record.bmi ?? null;
		case "HEAD_CIRCUMFERENCE":
			return record.headCircumference ?? null;
		default:
			return null;
	}
}

export function getZScoreValue(record: GrowthRecordMeasurement, type: string): number | null {
	switch (type) {
		case "WEIGHT":
			return record.weightForAgeZ ?? null;
		case "HEIGHT":
			return record.heightForAgeZ ?? null;
		case "BMI":
			return record.bmiForAgeZ ?? null;
		default:
			return null;
	}
}

export function getAge(dateOfBirth: Da): string {
	const today = new Date();
	const birthDate = new Date(dateOfBirth);
	let ageMonths = (today.getFullYear() - birthDate.getFullYear()) * 12;
	ageMonths += today.getMonth() - birthDate.getMonth();
	if (today.getDate() < birthDate.getDate()) ageMonths--;

	if (ageMonths < 24) {
		return `${ageMonths} months`;
	}
	const years = Math.floor(ageMonths / 12);
	return `${years} years`;
}


	export const calculateAge = (dateOfBirth: Date): string => {
		const today = new Date();
		let years = today.getFullYear() - dateOfBirth.getFullYear();
		let months = today.getMonth() - dateOfBirth.getMonth();
		let days = today.getDate() - dateOfBirth.getDate();

		if (days < 0) {
			months--;
			days += new Date(today.getFullYear(), today.getMonth(), 0).getDate();
		}
		if (months < 0) {
			years--;
			months += 12;
		}

		if (years > 0) return `${years}y ${months}m`;
		if (months > 0) return `${months}m ${days}d`;
		return `${days}d`;
	};

import { createInsertSchema, createSelectSchema, createUpdateSchema } from "drizzle-zod";
import z from "zod";

import {
	account,
	appointment,
	clinicMembers,
	clinicSetting,
	clinics,
	configStore,
	developmentalChecks,
	developmentalMilestones,
	diagnosis,
	doctor,
	doseGuideline,
	drug,
	feedingLog,
	files,
	fileUpload,
	folders,
	growthRecord,
	guardian,
	immunization,
	invites,
	labTest,
	medicalRecord,
	patient,
	patientBill,
	payment,
	prescribedItem,
	prescription,
	rating,
	reminder,
	service,
	session,
	staff,
	twoFactor,
	user,
	userQuota,
	vaccineSchedule,
	verification,
	vitalSign,
	whoGrowthStandard,
	workingDays
} from "../db/schema";

export const doctorStatusEnum = ["ACTIVE", "INACTIVE"] as const;
export type DoctorStatus = (typeof doctorStatusEnum)[number];
export const DiagnosisCreateSchema = createInsertSchema(diagnosis);
export const DiagnosisUpdateSchema = createUpdateSchema(diagnosis);
export const DiagnosisSelectSchema = createSelectSchema(diagnosis);

export const patientStatusEnum = ["ACTIVE", "INACTIVE"] as const;
export type PatientStatus = (typeof patientStatusEnum)[number];
export const UserCreateSchema = createInsertSchema(user);
export const UserUpdateSchema = createUpdateSchema(user);
export const UserSelectSchema = createSelectSchema(user);
export const AppointmentsCreateSchema = createInsertSchema(appointment);
export const ClinicSettingsCreateSchema = createInsertSchema(clinicSetting);
export const ClinicsCreateSchema = createInsertSchema(clinics);
export const DevelopmentalChecksCreateSchema = createInsertSchema(developmentalChecks);
export const DoctorsCreateSchema = createInsertSchema(doctor);
export const DoseGuidelinesCreateSchema = createInsertSchema(doseGuideline);
export const DrugsCreateSchema = createInsertSchema(drug);
export const FeedingLogsCreateSchema = createInsertSchema(feedingLog);
export const ImmunizationsCreateSchema = createInsertSchema(immunization);
export const LabTestsCreateSchema = createInsertSchema(labTest);
export const MedicalRecordsCreateSchema = createInsertSchema(medicalRecord);
export const PatientBillsCreateSchema = createInsertSchema(patientBill);
export const PatientsCreateSchema = createInsertSchema(patient);
export const PaymentsCreateSchema = createInsertSchema(payment);
export const PrescribedItemsCreateSchema = createInsertSchema(prescribedItem);
export const PrescriptionsCreateSchema = createInsertSchema(prescription);
export const RatingsCreateSchema = createInsertSchema(rating);
export const RemindersCreateSchema = createInsertSchema(reminder);
export const ServicesCreateSchema = createInsertSchema(service);
export const UsersToClinicsCreateSchema = createInsertSchema(clinicMembers);
export const VaccineSchedulesCreateSchema = createInsertSchema(vaccineSchedule);
export const VitalSignsCreateSchema = createInsertSchema(vitalSign);
export const WorkingDaysCreateSchema = createInsertSchema(workingDays);

export const AppointmentsUpdateSchema = createUpdateSchema(appointment);
export const ClinicSettingsUpdateSchema = createUpdateSchema(clinicSetting);
export const ClinicsUpdateSchema = createUpdateSchema(clinics);
export const DevelopmentalChecksUpdateSchema = createUpdateSchema(developmentalChecks);
export const DoctorsUpdateSchema = createUpdateSchema(doctor);
export const DoseGuidelinesUpdateSchema = createUpdateSchema(doseGuideline);
export const DrugsUpdateSchema = createUpdateSchema(drug);
export const FeedingLogsUpdateSchema = createUpdateSchema(feedingLog);
export const ImmunizationsUpdateSchema = createUpdateSchema(immunization);
export const LabTestsUpdateSchema = createUpdateSchema(labTest);
export const MedicalRecordsUpdateSchema = createUpdateSchema(medicalRecord);
export const PatientBillsUpdateSchema = createUpdateSchema(patientBill);
export const PatientsUpdateSchema = createUpdateSchema(patient);
export const PaymentsUpdateSchema = createUpdateSchema(payment);
export const PrescribedItemsUpdateSchema = createUpdateSchema(prescribedItem);
export const PrescriptionsUpdateSchema = createUpdateSchema(prescription);
export const RatingsUpdateSchema = createUpdateSchema(rating);
export const RemindersUpdateSchema = createUpdateSchema(reminder);
export const ServicesUpdateSchema = createUpdateSchema(service);
export const UsersToClinicsUpdateSchema = createUpdateSchema(clinicMembers);
export const VaccineSchedulesUpdateSchema = createUpdateSchema(vaccineSchedule);
export const VitalSignsUpdateSchema = createUpdateSchema(vitalSign);
export const WorkingDaysUpdateSchema = createUpdateSchema(workingDays);

export const UserSchema = createSelectSchema(user);
export type User = z.infer<typeof UserSchema>;
export const UserQuotaSchema = createSelectSchema(userQuota);
export type UserQuota = z.infer<typeof UserQuotaSchema>;
export const SessionSchema = createSelectSchema(session);
export type Session = z.infer<typeof SessionSchema>;
export const AccountSchema = createSelectSchema(account);
export type Account = z.infer<typeof AccountSchema>;
export const VerificationSchema = createSelectSchema(verification);
export type Verification = z.infer<typeof VerificationSchema>;
export const TwoFactorSchema = createSelectSchema(twoFactor);
export type TwoFactor = z.infer<typeof TwoFactorSchema>;
export const FoldersSchema = createSelectSchema(folders);
export type Folders = z.infer<typeof FoldersSchema>;
export const FilesSchema = createSelectSchema(files);
export type Files = z.infer<typeof FilesSchema>;
export const ConfigStoreSchema = createSelectSchema(configStore);
export type ConfigStore = z.infer<typeof ConfigStoreSchema>;
export const InvitesSchema = createSelectSchema(invites);
export type Invites = z.infer<typeof InvitesSchema>;
export const ClinicsSchema = createSelectSchema(clinics);
export type Clinics = z.infer<typeof ClinicsSchema>;
export const ClinicMembersSchema = createSelectSchema(clinicMembers);
export type ClinicMembers = z.infer<typeof ClinicMembersSchema>;
export const DoctorSchema = createSelectSchema(doctor);
export type Doctor = z.infer<typeof DoctorSchema>;
export const WorkingDaysSchema = createSelectSchema(workingDays);
export type WorkingDays = z.infer<typeof WorkingDaysSchema>;
export const StaffSchema = createSelectSchema(staff);
export type Staff = z.infer<typeof StaffSchema>;
export const PatientSchema = createSelectSchema(patient);
export type Patient = z.infer<typeof PatientSchema>;
export const AppointmentSchema = createSelectSchema(appointment);
export type Appointment = z.infer<typeof AppointmentSchema>;
export const MedicalRecordSchema = createSelectSchema(medicalRecord);
export type MedicalRecord = z.infer<typeof MedicalRecordSchema>;
export const DiagnosisSchema = createSelectSchema(diagnosis);
export type Diagnosis = z.infer<typeof DiagnosisSchema>;
export const VitalSignSchema = createSelectSchema(vitalSign);
export type VitalSign = z.infer<typeof VitalSignSchema>;
export const GrowthRecordSchema = createSelectSchema(growthRecord);
export type GrowthRecord = z.infer<typeof GrowthRecordSchema>;
export const ImmunizationSchema = createSelectSchema(immunization);
export type Immunization = z.infer<typeof ImmunizationSchema>;
export const ServiceSchema = createSelectSchema(service);
export type Service = z.infer<typeof ServiceSchema>;
export const LabTestSchema = createSelectSchema(labTest);
export type LabTest = z.infer<typeof LabTestSchema>;
export const PaymentSchema = createSelectSchema(payment);
export type Payment = z.infer<typeof PaymentSchema>;
export const PatientBillSchema = createSelectSchema(patientBill);
export type PatientBill = z.infer<typeof PatientBillSchema>;
export const ReminderSchema = createSelectSchema(reminder);
export type Reminder = z.infer<typeof ReminderSchema>;
export const ClinicSettingSchema = createSelectSchema(clinicSetting);
export type ClinicSetting = z.infer<typeof ClinicSettingSchema>;
export const PrescriptionSchema = createSelectSchema(prescription);
export type Prescription = z.infer<typeof PrescriptionSchema>;
export const WhoGrowthStandardSchema = createSelectSchema(whoGrowthStandard);
export type WhoGrowthStandard = z.infer<typeof WhoGrowthStandardSchema>;
export const RatingSchema = createSelectSchema(rating);
export type Rating = z.infer<typeof RatingSchema>;
export const DrugSchema = createSelectSchema(drug);
export type Drug = z.infer<typeof DrugSchema>;
export const DoseGuidelineSchema = createSelectSchema(doseGuideline);
export type DoseGuideline = z.infer<typeof DoseGuidelineSchema>;
export const PrescribedItemSchema = createSelectSchema(prescribedItem);
export type PrescribedItem = z.infer<typeof PrescribedItemSchema>;
export const FileUploadSchema = createSelectSchema(fileUpload);
export type FileUpload = z.infer<typeof FileUploadSchema>;
export const GuardianSchema = createSelectSchema(guardian);
export type Guardian = z.infer<typeof GuardianSchema>;
export const FeedingLogSchema = createSelectSchema(feedingLog);
export type FeedingLog = z.infer<typeof FeedingLogSchema>;
export const DevelopmentalMilestonesSchema = createSelectSchema(developmentalMilestones);
export type DevelopmentalMilestones = z.infer<typeof DevelopmentalMilestonesSchema>;
export const DevelopmentalChecksSchema = createSelectSchema(developmentalChecks);
export type DevelopmentalChecks = z.infer<typeof DevelopmentalChecksSchema>;
export const VaccineScheduleSchema = createSelectSchema(vaccineSchedule);
export type VaccineSchedule = z.infer<typeof VaccineScheduleSchema>;

export const TodoSchema = z.object({
	id: z.number().int().min(1),
	name: z.string()
});

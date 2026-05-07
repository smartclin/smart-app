ALTER TABLE `vaccine_schedule` ADD `due_date` integer;--> statement-breakpoint
ALTER TABLE `vaccine_schedule` ADD `status` text DEFAULT 'ACTIVE';--> statement-breakpoint
ALTER TABLE `vaccine_schedule` ADD `is_over_due` integer DEFAULT false;--> statement-breakpoint
ALTER TABLE `vaccine_schedule` ADD `deleted_at` integer;
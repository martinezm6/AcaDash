CREATE TABLE `classes` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`subject_id` integer NOT NULL,
	`days_of_week` text NOT NULL,
	`start_time` text NOT NULL,
	`end_time` text NOT NULL,
	`room` text,
	`professor` text,
	FOREIGN KEY (`subject_id`) REFERENCES `subjects`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `events` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`title` text NOT NULL,
	`date` text NOT NULL,
	`description` text,
	`type` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `subjects` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`semester` text NOT NULL,
	`target_grade` real,
	`current_grade` real,
	`completed` integer DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE TABLE `tasks` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`title` text NOT NULL,
	`subject_id` integer,
	`due_date` text NOT NULL,
	`completed` integer DEFAULT false NOT NULL,
	FOREIGN KEY (`subject_id`) REFERENCES `subjects`(`id`) ON UPDATE no action ON DELETE cascade
);

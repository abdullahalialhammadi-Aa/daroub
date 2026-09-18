CREATE TABLE `team_boards` (
	`id` text PRIMARY KEY NOT NULL,
	`owner` text NOT NULL,
	`trip_id` text NOT NULL,
	`state` text NOT NULL,
	`revision` integer NOT NULL,
	`updated_at` text NOT NULL,
	`invite_hash` text,
	`invite_expires_at` text,
	`closed` integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `idx_team_boards_owner_trip` ON `team_boards` (`owner`,`trip_id`);
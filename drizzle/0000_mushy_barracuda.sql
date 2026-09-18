CREATE TABLE `sync_receipts` (
	`owner` text NOT NULL,
	`operation_id` text NOT NULL,
	`result` text NOT NULL,
	`created_at` text NOT NULL,
	PRIMARY KEY(`owner`, `operation_id`)
);
--> statement-breakpoint
CREATE TABLE `records` (
	`owner` text NOT NULL,
	`entity` text NOT NULL,
	`id` text NOT NULL,
	`payload` text NOT NULL,
	`revision` integer NOT NULL,
	`deleted` integer DEFAULT 0 NOT NULL,
	`updated_at` text NOT NULL,
	`last_operation` text NOT NULL,
	PRIMARY KEY(`owner`, `entity`, `id`)
);
--> statement-breakpoint
CREATE INDEX `idx_records_owner_updated` ON `records` (`owner`,`updated_at`);
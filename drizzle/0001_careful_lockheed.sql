CREATE TABLE `catalog_drafts` (
	`id` text PRIMARY KEY NOT NULL,
	`revision` integer NOT NULL,
	`base_revision` integer NOT NULL,
	`payload` text NOT NULL,
	`reviewed` text NOT NULL,
	`updated_at` text NOT NULL,
	`actor` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `catalog_heads` (
	`id` integer PRIMARY KEY NOT NULL,
	`revision` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `catalog_versions` (
	`revision` integer PRIMARY KEY NOT NULL,
	`payload` text NOT NULL,
	`actor` text NOT NULL,
	`published_at` text NOT NULL,
	`operation` text NOT NULL,
	`restored_from` integer
);

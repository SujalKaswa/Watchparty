ALTER TABLE `catalog_movies` ADD `videoUrl` varchar(500);--> statement-breakpoint
ALTER TABLE `catalog_movies` ADD `playbackSourceType` enum('official','public-domain');--> statement-breakpoint
ALTER TABLE `catalog_movies` ADD `playbackSourceUrl` text;--> statement-breakpoint
ALTER TABLE `catalog_movies` ADD `playbackRightsNote` varchar(512);
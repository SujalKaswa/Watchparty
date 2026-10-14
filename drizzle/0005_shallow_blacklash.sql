CREATE TABLE `catalog_movie_genres` (
	`id` int AUTO_INCREMENT NOT NULL,
	`movieId` varchar(64) NOT NULL,
	`genre` varchar(32) NOT NULL,
	CONSTRAINT `catalog_movie_genres_id` PRIMARY KEY(`id`),
	CONSTRAINT `catalog_movie_genre_unique` UNIQUE(`movieId`,`genre`)
);
--> statement-breakpoint
CREATE TABLE `catalog_movies` (
	`id` varchar(64) NOT NULL,
	`title` varchar(160) NOT NULL,
	`industry` enum('Bollywood','Hollywood') NOT NULL,
	`year` int NOT NULL,
	`runtime` int NOT NULL,
	`genre` varchar(32) NOT NULL,
	`mood` varchar(32) NOT NULL,
	`synopsis` text NOT NULL,
	`posterUrl` varchar(500) NOT NULL,
	`posterSourceUrl` text NOT NULL,
	`metadataSourcesJson` text NOT NULL,
	`paletteJson` varchar(80) NOT NULL,
	`featured` int NOT NULL DEFAULT 1,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `catalog_movies_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE INDEX `catalog_movie_genres_genre_idx` ON `catalog_movie_genres` (`genre`,`movieId`);--> statement-breakpoint
CREATE INDEX `catalog_movies_industry_year_idx` ON `catalog_movies` (`industry`,`year`);--> statement-breakpoint
CREATE INDEX `catalog_movies_genre_idx` ON `catalog_movies` (`genre`);
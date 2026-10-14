CREATE TABLE `watch_room_messages` (
	`id` varchar(36) NOT NULL,
	`roomId` varchar(36) NOT NULL,
	`participantId` varchar(36) NOT NULL,
	`displayName` varchar(32) NOT NULL,
	`body` varchar(320) NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `watch_room_messages_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `watch_playlist_entries` (
	`id` varchar(36) NOT NULL,
	`roomId` varchar(36) NOT NULL,
	`movieId` varchar(64) NOT NULL,
	`title` varchar(120) NOT NULL,
	`year` int NOT NULL,
	`runtime` int NOT NULL,
	`genre` varchar(32) NOT NULL,
	`addedBy` varchar(36) NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `watch_playlist_entries_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `watch_room_poll_votes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`pollId` varchar(36) NOT NULL,
	`participantId` varchar(36) NOT NULL,
	`optionIndex` int NOT NULL,
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `watch_room_poll_votes_id` PRIMARY KEY(`id`),
	CONSTRAINT `watch_poll_participant_unique` UNIQUE(`pollId`,`participantId`)
);
--> statement-breakpoint
CREATE TABLE `watch_room_polls` (
	`id` varchar(36) NOT NULL,
	`roomId` varchar(36) NOT NULL,
	`question` varchar(240) NOT NULL,
	`optionsJson` text NOT NULL,
	`createdBy` varchar(36) NOT NULL,
	`state` enum('open','closed') NOT NULL DEFAULT 'open',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `watch_room_polls_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `watch_room_participants` (
	`id` int AUTO_INCREMENT NOT NULL,
	`roomId` varchar(36) NOT NULL,
	`participantId` varchar(36) NOT NULL,
	`displayName` varchar(32) NOT NULL,
	`joinedAt` timestamp NOT NULL DEFAULT (now()),
	`lastSeenAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `watch_room_participants_id` PRIMARY KEY(`id`),
	CONSTRAINT `watch_room_participant_unique` UNIQUE(`roomId`,`participantId`)
);
--> statement-breakpoint
CREATE TABLE `watch_rooms` (
	`id` varchar(36) NOT NULL,
	`code` varchar(10) NOT NULL,
	`title` varchar(120) NOT NULL,
	`hostId` varchar(36) NOT NULL,
	`movieId` varchar(64),
	`movieTitle` varchar(120),
	`videoUrl` varchar(500),
	`durationMs` int NOT NULL DEFAULT 0,
	`positionMs` int NOT NULL DEFAULT 0,
	`playing` int NOT NULL DEFAULT 0,
	`revision` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `watch_rooms_id` PRIMARY KEY(`id`),
	CONSTRAINT `watch_rooms_code_unique` UNIQUE(`code`)
);
--> statement-breakpoint
CREATE INDEX `watch_room_messages_room_idx` ON `watch_room_messages` (`roomId`,`createdAt`);--> statement-breakpoint
CREATE INDEX `watch_playlist_room_idx` ON `watch_playlist_entries` (`roomId`,`createdAt`);--> statement-breakpoint
CREATE INDEX `watch_poll_votes_poll_idx` ON `watch_room_poll_votes` (`pollId`);--> statement-breakpoint
CREATE INDEX `watch_room_polls_room_idx` ON `watch_room_polls` (`roomId`,`createdAt`);--> statement-breakpoint
CREATE INDEX `watch_room_participants_room_idx` ON `watch_room_participants` (`roomId`,`lastSeenAt`);
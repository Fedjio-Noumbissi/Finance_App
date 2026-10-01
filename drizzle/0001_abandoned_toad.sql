ALTER TABLE "users" ALTER COLUMN "mot_de_passe_hash" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "firebase_uid" text;--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_firebaseUid_unique" UNIQUE("firebase_uid");
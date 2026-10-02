-- Administration : rôle utilisateur et suivi du trafic du site.
CREATE TYPE "user_role" AS ENUM ('user', 'admin');
--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "role" "user_role" DEFAULT 'user' NOT NULL;
--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "derniere_activite" timestamp with time zone;
--> statement-breakpoint
UPDATE "users"
SET "role" = 'admin', "derniere_activite" = now()
WHERE "email" = 'fedjio@gmail.com';
--> statement-breakpoint
CREATE TABLE "page_views" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "user_id" uuid,
  "chemin" text NOT NULL,
  "source" text,
  "date_creation" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "page_views"
  ADD CONSTRAINT "page_views_user_id_users_id_fk"
  FOREIGN KEY ("user_id") REFERENCES "public"."users"("id")
  ON DELETE set null;
--> statement-breakpoint
CREATE INDEX "page_views_date_creation_idx" ON "page_views" ("date_creation");
--> statement-breakpoint
CREATE INDEX "page_views_chemin_idx" ON "page_views" ("chemin");
--> statement-breakpoint
CREATE INDEX "page_views_user_id_idx" ON "page_views" ("user_id");

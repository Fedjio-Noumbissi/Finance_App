UPDATE "users" AS u
SET "onboarding_terminee" = true
WHERE u."onboarding_terminee" = false
  AND EXISTS (
    SELECT 1
    FROM "transactions" AS t
    WHERE t."user_id" = u."id"
  );

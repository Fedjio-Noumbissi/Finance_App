-- Correction des decimales du franc CFA BCEAO.
--
-- La migration 0004 a insere XOF avec 2 decimales alors que sa jumelle XAF en
-- a 0 et que l'ISO 4217 ne definit aucun sous-unite pour ces deux devises.
-- Consequence : les montants en XOF (devise de base, preference par defaut)
-- s'affichaient avec des centimes inexistants ("135 000,00 FCFA").
UPDATE "currencies"
  SET "decimales" = 0
  WHERE "code" IN ('XOF', 'XAF');
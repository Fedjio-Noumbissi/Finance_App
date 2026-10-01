-- Devises : table de reference, devise d'affichage par utilisateur et devise
-- de saisie par transaction.
--
-- Le catalogue est insere avant la creation des contraintes etrangeres : les
-- colonnes ont la valeur par defaut 'XOF', qui doit donc deja exister.
CREATE TABLE IF NOT EXISTS "currencies" (
  "code" text PRIMARY KEY,
  "nom_fr" text NOT NULL,
  "nom_en" text NOT NULL,
  "decimales" integer NOT NULL DEFAULT 2,
  "taux_vers_xof" numeric(20, 8) NOT NULL DEFAULT 1,
  "mis_a_jour" timestamp with time zone NOT NULL DEFAULT now()
);

-- 1 unite de la devise vaut la valeur indiquee en francs CFA (XOF).
-- Ces taux de depart sont indicatifs et restent modifiables depuis les
-- reglages de l'application.
INSERT INTO "currencies" ("code", "nom_fr", "nom_en", "decimales", "taux_vers_xof")
VALUES
  ('XOF', 'Franc CFA (BCEAO)', 'CFA franc (BCEAO)', 2, 1),
  ('XAF', 'Franc CFA (BEAC)', 'CFA franc (BEAC)', 0, 1),
  ('GHS', 'Cedi ghanéen', 'Ghanaian cedi', 2, 50),
  ('NGN', 'Naira nigérian', 'Nigerian naira', 2, 0.4),
  ('KES', 'Shilling kényan', 'Kenyan shilling', 2, 4.6),
  ('ZAR', 'Rand sud-africain', 'South African rand', 2, 33),
  ('MAD', 'Dirham marocain', 'Moroccan dirham', 2, 61),
  ('DZD', 'Dinar algérien', 'Algerian dinar', 3, 4.4),
  ('TND', 'Dinar tunisien', 'Tunisian dinar', 3, 208),
  ('EGP', 'Livre égyptienne', 'Egyptian pound', 2, 12.5),
  ('ETB', 'Birr éthiopien', 'Ethiopian birr', 2, 5.3),
  ('UGX', 'Shilling ougandais', 'Ugandan shilling', 0, 0.17),
  ('TZS', 'Shilling tanzanien', 'Tanzanian shilling', 0, 0.39),
  ('EUR', 'Euro', 'Euro', 2, 655.957),
  ('GBP', 'Livre sterling', 'British pound', 2, 786),
  ('CHF', 'Franc suisse', 'Swiss franc', 2, 672),
  ('SEK', 'Couronne suédoise', 'Swedish krona', 2, 60),
  ('NOK', 'Couronne norvégienne', 'Norwegian krone', 2, 55),
  ('DKK', 'Couronne danoise', 'Danish krone', 2, 88),
  ('PLN', 'Zloty polonais', 'Polish zloty', 2, 157),
  ('CZK', 'Couronne tchèque', 'Czech koruna', 2, 26.9),
  ('HUF', 'Forint hongrois', 'Hungarian forint', 2, 1.7),
  ('RON', 'Leu roumain', 'Romanian leu', 2, 132),
  ('BGN', 'Lev bulgare', 'Bulgarian lev', 2, 335),
  ('RUB', 'Rouble russe', 'Russian ruble', 2, 6.6),
  ('TRY', 'Livre turque', 'Turkish lira', 2, 15.5),
  ('UAH', 'Hryvnia ukrainienne', 'Ukrainian hryvnia', 2, 14.5),
  ('USD', 'Dollar américain', 'US dollar', 2, 600),
  ('CAD', 'Dollar canadien', 'Canadian dollar', 2, 440),
  ('MXN', 'Peso mexicain', 'Mexican peso', 2, 33),
  ('BRL', 'Réal brésilien', 'Brazilian real', 2, 108),
  ('ARS', 'Peso argentin', 'Argentine peso', 2, 0.54),
  ('CLP', 'Peso chilien', 'Chilean peso', 0, 0.63),
  ('COP', 'Peso colombien', 'Colombian peso', 0, 0.15),
  ('PEN', 'Sol péruvien', 'Peruvian sol', 2, 160),
  ('UYU', 'Peso uruguayen', 'Uruguayan peso', 2, 15.8),
  ('JPY', 'Yen japonais', 'Japanese yen', 0, 3.9),
  ('CNY', 'Yuan chinois', 'Chinese yuan', 2, 83),
  ('INR', 'Roupie indienne', 'Indian rupee', 2, 7.2),
  ('KRW', 'Won sud-coréen', 'South Korean won', 0, 0.44),
  ('SGD', 'Dollar singapourien', 'Singapore dollar', 2, 445),
  ('HKD', 'Dollar hongkongais', 'Hong Kong dollar', 2, 77),
  ('TWD', 'Dollar taïwanais', 'New Taiwan dollar', 2, 18.6),
  ('IDR', 'Roupie indonésienne', 'Indonesian rupiah', 0, 0.037),
  ('MYR', 'Ringgit malaisien', 'Malaysian ringgit', 2, 134),
  ('PHP', 'Peso philippin', 'Philippine peso', 2, 10.4),
  ('VND', 'Dong vietnamien', 'Vietnamese dong', 0, 0.023),
  ('THB', 'Baht thaïlandais', 'Thai baht', 2, 17),
  ('PKR', 'Roupie pakistanaise', 'Pakistani rupee', 2, 2.1),
  ('BDT', 'Taka bangladais', 'Bangladeshi taka', 2, 5.1),
  ('LKR', 'Roupie sri-lankaise', 'Sri Lankan rupee', 2, 1.9),
  ('KZT', 'Tenge kazakh', 'Kazakhstani tenge', 2, 1.3),
  ('SAR', 'Riyal saoudien', 'Saudi riyal', 2, 160),
  ('AED', 'Dirham des Émirats', 'UAE dirham', 2, 163),
  ('QAR', 'Riyal qatari', 'Qatari riyal', 2, 165),
  ('KWD', 'Dinar koweïtien', 'Kuwaiti dinar', 3, 1950),
  ('BHD', 'Dinar bahreïnien', 'Bahraini dinar', 3, 1590),
  ('OMR', 'Rial omanais', 'Omani rial', 3, 1560),
  ('JOD', 'Dinar jordanien', 'Jordanian dinar', 3, 846),
  ('ILS', 'Shekel israélien', 'Israeli shekel', 2, 170),
  ('LBP', 'Livre libanaise', 'Lebanese pound', 2, 0.0067),
  ('AUD', 'Dollar australien', 'Australian dollar', 2, 390),
  ('NZD', 'Dollar néo-zélandais', 'New Zealand dollar', 2, 355),
  ('FJD', 'Dollar fijien', 'Fijian dollar', 2, 268)
ON CONFLICT ("code") DO NOTHING;

ALTER TABLE "users"
  ADD COLUMN IF NOT EXISTS "devise_preferee" text NOT NULL DEFAULT 'XOF';

ALTER TABLE "transactions"
  ADD COLUMN IF NOT EXISTS "devise" text NOT NULL DEFAULT 'XOF';

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'users_devise_preferee_fkey'
  ) THEN
    ALTER TABLE "users"
      ADD CONSTRAINT "users_devise_preferee_fkey"
      FOREIGN KEY ("devise_preferee") REFERENCES "currencies"("code")
      ON UPDATE CASCADE ON DELETE RESTRICT;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'transactions_devise_fkey'
  ) THEN
    ALTER TABLE "transactions"
      ADD CONSTRAINT "transactions_devise_fkey"
      FOREIGN KEY ("devise") REFERENCES "currencies"("code")
      ON UPDATE CASCADE ON DELETE RESTRICT;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS "transactions_user_devise_idx"
  ON "transactions" ("user_id", "devise");

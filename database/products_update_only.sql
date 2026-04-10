-- Update-only refresh for products
-- Generated from diff between export_db_products_data_20260409.csv and products_cleaned_20260409.csv
-- Safe for FK constraints on order_product because it does NOT delete rows.

START TRANSACTION;

-- ID 25 | Barretta Cacao e Nocciole
UPDATE `products`
SET
  `quantity_available` = 0
WHERE `id` = 25;

-- ID 41 | Razione 1200 kcal Classica
UPDATE `products`
SET
  `weight_grams` = 240,
  `calories` = 1200
WHERE `id` = 41;

-- ID 42 | Razione 1200 kcal Cacao
UPDATE `products`
SET
  `weight_grams` = 240,
  `servings` = 6,
  `calories` = 1200
WHERE `id` = 42;

-- ID 43 | Razione 2400 kcal Survival
UPDATE `products`
SET
  `price` = 21.9,
  `weight_grams` = 480,
  `servings` = 12,
  `calories` = 2400
WHERE `id` = 43;

-- ID 44 | Razione 2400 kcal Arancia
UPDATE `products`
SET
  `price` = 23.9,
  `weight_grams` = 480,
  `servings` = 12,
  `calories` = 2400
WHERE `id` = 44;

-- ID 45 | Razione 3600 kcal Family Pack
UPDATE `products`
SET
  `price` = 29.9,
  `weight_grams` = 720,
  `servings` = 18,
  `calories` = 3600
WHERE `id` = 45;

-- ID 46 | Biscotti d'Emergenza 12h
UPDATE `products`
SET
  `calories` = 1200,
  `quantity_available` = 0
WHERE `id` = 46;

-- ID 47 | Barra Compatta 500 kcal
UPDATE `products`
SET
  `price` = 7.9,
  `weight_grams` = 100,
  `calories` = 500
WHERE `id` = 47;

-- ID 48 | Barra Compatta 800 kcal
UPDATE `products`
SET
  `price` = 8.9,
  `weight_grams` = 160,
  `servings` = 1,
  `calories` = 800
WHERE `id` = 48;

-- ID 49 | Kit Razione 24 Ore Base
UPDATE `products`
SET
  `weight_grams` = 480
WHERE `id` = 49;

-- ID 51 | Razione Nautica 2400 kcal
UPDATE `products`
SET
  `price` = 23.9,
  `weight_grams` = 480,
  `servings` = 12,
  `calories` = 2400
WHERE `id` = 51;

-- ID 52 | Razione Montagna 2400 kcal
UPDATE `products`
SET
  `price` = 23.9,
  `weight_grams` = 480,
  `servings` = 12,
  `calories` = 2400
WHERE `id` = 52;

-- ID 54 | Blocco Energetico Cacao
UPDATE `products`
SET
  `price` = 15.9,
  `servings` = 8,
  `calories` = 2400
WHERE `id` = 54;

-- ID 56 | Razione Tropicale 2400 kcal
UPDATE `products`
SET
  `price` = 23.9,
  `weight_grams` = 480,
  `servings` = 12,
  `calories` = 2400
WHERE `id` = 56;

-- ID 57 | Razione Invernale 2400 kcal
UPDATE `products`
SET
  `price` = 24.9,
  `weight_grams` = 480,
  `servings` = 12,
  `calories` = 2400
WHERE `id` = 57;

-- ID 58 | Razione Tascabile 900 kcal
UPDATE `products`
SET
  `price` = 9.9,
  `weight_grams` = 180,
  `servings` = 1,
  `calories` = 900
WHERE `id` = 58;

-- ID 59 | Pack Alta Energia 1800 kcal
UPDATE `products`
SET
  `price` = 17.9,
  `weight_grams` = 360,
  `servings` = 9,
  `calories` = 1800
WHERE `id` = 59;

-- ID 65 | Bevanda Isotonica Agrumi
UPDATE `products`
SET
  `quantity_available` = 0
WHERE `id` = 65;

-- ID 82 | Scorta d'acqua potabile 10L
UPDATE `products`
SET
  `quantity_available` = 0
WHERE `id` = 82;

COMMIT;
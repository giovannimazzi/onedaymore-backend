UPDATE products
SET image_url = REPLACE(
  image_url,
  'https://cdn.onedaymore.local/products/',
  ''
)
WHERE id>0;
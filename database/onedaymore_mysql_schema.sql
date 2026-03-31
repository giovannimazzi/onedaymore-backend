-- OneDayMore - MySQL schema
-- Compatible with MySQL 8+

DROP DATABASE IF EXISTS onedaymore;
CREATE DATABASE onedaymore
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE onedaymore;

-- -----------------------------------------------------
-- TABLE: categories
-- -----------------------------------------------------
CREATE TABLE categories (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL,
    description TEXT NULL,
    created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT uq_categories_slug UNIQUE (slug)
) ENGINE=InnoDB;

-- -----------------------------------------------------
-- TABLE: products
-- -----------------------------------------------------
CREATE TABLE products (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    category_id BIGINT UNSIGNED NOT NULL,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL,
    short_description VARCHAR(500) NULL,
    description TEXT NULL,
    brand VARCHAR(255) NULL,
    price DECIMAL(10,2) NOT NULL,
    weight_grams INT UNSIGNED NULL,
    servings INT UNSIGNED NULL,
    calories INT UNSIGNED NULL,
    storage_life_months INT UNSIGNED NULL,
    preparation_type VARCHAR(255) NULL,
    water_needed_ml INT UNSIGNED NULL,
    quantity_available INT UNSIGNED NOT NULL DEFAULT 0,
    is_active TINYINT(1) NOT NULL DEFAULT 1,
    image_url VARCHAR(500) NULL,
    created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT uq_products_slug UNIQUE (slug),
    CONSTRAINT fk_products_category
        FOREIGN KEY (category_id)
        REFERENCES categories(id)
        ON UPDATE CASCADE
        ON DELETE RESTRICT,

    CONSTRAINT chk_products_price_non_negative CHECK (price >= 0),
    CONSTRAINT chk_products_quantity_available_non_negative CHECK (quantity_available >= 0),
    CONSTRAINT chk_products_weight_non_negative CHECK (weight_grams IS NULL OR weight_grams >= 0),
    CONSTRAINT chk_products_servings_positive CHECK (servings IS NULL OR servings > 0),
    CONSTRAINT chk_products_calories_non_negative CHECK (calories IS NULL OR calories >= 0),
    CONSTRAINT chk_products_storage_life_non_negative CHECK (storage_life_months IS NULL OR storage_life_months >= 0),
    CONSTRAINT chk_products_water_needed_non_negative CHECK (water_needed_ml IS NULL OR water_needed_ml >= 0)
) ENGINE=InnoDB;

CREATE INDEX idx_products_category_id ON products(category_id);
CREATE INDEX idx_products_name ON products(name);
CREATE INDEX idx_products_is_active ON products(is_active);

-- -----------------------------------------------------
-- TABLE: discount_codes
-- -----------------------------------------------------
CREATE TABLE discount_codes (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(255) NOT NULL,
    description VARCHAR(500) NULL,
    discount_type ENUM('fixed', 'percentage') NOT NULL,
    discount_value DECIMAL(10,2) NOT NULL,
    min_order_amount DECIMAL(10,2) NULL,
    starts_at DATETIME NULL,
    ends_at DATETIME NULL,
    is_active TINYINT(1) NOT NULL DEFAULT 1,
    created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT uq_discount_codes_code UNIQUE (code),
    CONSTRAINT chk_discount_codes_value_non_negative CHECK (discount_value >= 0),
    CONSTRAINT chk_discount_codes_min_order_non_negative CHECK (min_order_amount IS NULL OR min_order_amount >= 0),
    CONSTRAINT chk_discount_codes_date_range CHECK (ends_at IS NULL OR starts_at IS NULL OR ends_at >= starts_at)
) ENGINE=InnoDB;

-- -----------------------------------------------------
-- TABLE: orders
-- -----------------------------------------------------
CREATE TABLE orders (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    discount_code_id BIGINT UNSIGNED NULL,
    order_number VARCHAR(255) NOT NULL,
    customer_email VARCHAR(255) NOT NULL,
    customer_first_name VARCHAR(255) NOT NULL,
    customer_last_name VARCHAR(255) NOT NULL,
    phone VARCHAR(50) NULL,

    billing_address_line1 VARCHAR(255) NOT NULL,
    billing_address_line2 VARCHAR(255) NULL,
    billing_city VARCHAR(255) NOT NULL,
    billing_postal_code VARCHAR(50) NOT NULL,
    billing_province VARCHAR(255) NULL,
    billing_country VARCHAR(255) NOT NULL,

    shipping_address_line1 VARCHAR(255) NOT NULL,
    shipping_address_line2 VARCHAR(255) NULL,
    shipping_city VARCHAR(255) NOT NULL,
    shipping_postal_code VARCHAR(50) NOT NULL,
    shipping_province VARCHAR(255) NULL,
    shipping_country VARCHAR(255) NOT NULL,

    subtotal_amount DECIMAL(10,2) NOT NULL,
    discount_amount DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    shipping_amount DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    total_amount DECIMAL(10,2) NOT NULL,

    placed_at DATETIME NULL,
    status ENUM('pending','payment_failed','confirmed','processing','shipped','delivered','cancelled') NOT NULL DEFAULT 'pending',
    customer_email_sent TINYINT(1) NOT NULL DEFAULT 0,
    vendor_email_sent TINYINT(1) NOT NULL DEFAULT 0,
    created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT uq_orders_order_number UNIQUE (order_number),
    CONSTRAINT fk_orders_discount_code
        FOREIGN KEY (discount_code_id)
        REFERENCES discount_codes(id)
        ON UPDATE CASCADE
        ON DELETE SET NULL,

    CONSTRAINT chk_orders_subtotal_non_negative CHECK (subtotal_amount >= 0),
    CONSTRAINT chk_orders_discount_non_negative CHECK (discount_amount >= 0),
    CONSTRAINT chk_orders_shipping_non_negative CHECK (shipping_amount >= 0),
    CONSTRAINT chk_orders_total_non_negative CHECK (total_amount >= 0)
) ENGINE=InnoDB;

CREATE INDEX idx_orders_discount_code_id ON orders(discount_code_id);
CREATE INDEX idx_orders_customer_email ON orders(customer_email);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created_at ON orders(created_at);

-- -----------------------------------------------------
-- TABLE: order_product
-- Snapshot of purchased products at order time
-- -----------------------------------------------------
CREATE TABLE order_product (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    product_id BIGINT UNSIGNED NOT NULL,
    order_id BIGINT UNSIGNED NOT NULL,
    product_name VARCHAR(255) NOT NULL,
    unit_price DECIMAL(10,2) NOT NULL,
    quantity INT UNSIGNED NOT NULL,

    CONSTRAINT fk_order_product_product
        FOREIGN KEY (product_id)
        REFERENCES products(id)
        ON UPDATE CASCADE
        ON DELETE RESTRICT,
    CONSTRAINT fk_order_product_order
        FOREIGN KEY (order_id)
        REFERENCES orders(id)
        ON UPDATE CASCADE
        ON DELETE CASCADE,

    CONSTRAINT uq_order_product_order_product UNIQUE (order_id, product_id),
    CONSTRAINT chk_order_product_unit_price_non_negative CHECK (unit_price >= 0),
    CONSTRAINT chk_order_product_quantity_positive CHECK (quantity > 0)
) ENGINE=InnoDB;

CREATE INDEX idx_order_product_product_id ON order_product(product_id);
CREATE INDEX idx_order_product_order_id ON order_product(order_id);

-- -----------------------------------------------------
-- OPTIONAL VIEW: order lines with line total
-- Handy for queries without storing redundant line_total column
-- -----------------------------------------------------
CREATE OR REPLACE VIEW v_order_product_details AS
SELECT
    op.id,
    op.order_id,
    op.product_id,
    op.product_name,
    op.unit_price,
    op.quantity,
    (op.unit_price * op.quantity) AS line_total
FROM order_product op;

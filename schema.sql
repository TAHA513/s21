
-- Create session table for storing sessions
CREATE TABLE IF NOT EXISTS "session" (
  "sid" varchar NOT NULL COLLATE "default",
  "sess" json NOT NULL,
  "expire" timestamp(6) NOT NULL,
  CONSTRAINT "session_pkey" PRIMARY KEY ("sid")
);

-- Create users table
CREATE TABLE IF NOT EXISTS "users" (
  "id" SERIAL PRIMARY KEY,
  "username" varchar NOT NULL UNIQUE,
  "password" varchar NOT NULL,
  "name" varchar NOT NULL,
  "role" varchar NOT NULL DEFAULT 'user',
  "created_at" timestamp NOT NULL DEFAULT NOW()
);

-- Create customers table
CREATE TABLE IF NOT EXISTS "customers" (
  "id" SERIAL PRIMARY KEY,
  "name" varchar NOT NULL,
  "phone" varchar,
  "email" varchar,
  "address" text,
  "created_at" timestamp NOT NULL DEFAULT NOW()
);

-- Create products table
CREATE TABLE IF NOT EXISTS "products" (
  "id" SERIAL PRIMARY KEY,
  "name" varchar NOT NULL,
  "sku" varchar,
  "price" numeric NOT NULL DEFAULT 0,
  "cost" numeric NOT NULL DEFAULT 0,
  "quantity" integer NOT NULL DEFAULT 0,
  "group_id" integer,
  "created_at" timestamp NOT NULL DEFAULT NOW()
);

-- Create product_groups table
CREATE TABLE IF NOT EXISTS "product_groups" (
  "id" SERIAL PRIMARY KEY,
  "name" varchar NOT NULL,
  "description" text,
  "created_at" timestamp NOT NULL DEFAULT NOW()
);

-- Create appointments table
CREATE TABLE IF NOT EXISTS "appointments" (
  "id" SERIAL PRIMARY KEY,
  "customer_id" integer NOT NULL,
  "appointment_date" timestamp NOT NULL,
  "service" varchar NOT NULL,
  "status" varchar NOT NULL DEFAULT 'pending',
  "notes" text,
  "created_at" timestamp NOT NULL DEFAULT NOW()
);

-- Create invoices table
CREATE TABLE IF NOT EXISTS "invoices" (
  "id" SERIAL PRIMARY KEY,
  "customer_id" integer NOT NULL,
  "total_amount" numeric NOT NULL DEFAULT 0,
  "status" varchar NOT NULL DEFAULT 'pending',
  "payment_method" varchar,
  "created_at" timestamp NOT NULL DEFAULT NOW()
);

-- Create suppliers table
CREATE TABLE IF NOT EXISTS "suppliers" (
  "id" SERIAL PRIMARY KEY,
  "name" varchar NOT NULL,
  "contact_name" varchar,
  "phone" varchar,
  "email" varchar,
  "address" text,
  "created_at" timestamp NOT NULL DEFAULT NOW()
);

-- Create discount_codes table
CREATE TABLE IF NOT EXISTS "discount_codes" (
  "id" SERIAL PRIMARY KEY,
  "code" varchar NOT NULL UNIQUE,
  "discount_type" varchar NOT NULL,
  "discount_value" numeric NOT NULL,
  "valid_from" timestamp NOT NULL,
  "valid_to" timestamp,
  "usage_limit" integer,
  "used_count" integer NOT NULL DEFAULT 0,
  "created_at" timestamp NOT NULL DEFAULT NOW(),
  "updated_at" timestamp NOT NULL DEFAULT NOW()
);

-- Create purchase_orders table
CREATE TABLE IF NOT EXISTS "purchase_orders" (
  "id" SERIAL PRIMARY KEY,
  "supplier_id" integer NOT NULL,
  "order_date" timestamp NOT NULL,
  "total_amount" numeric NOT NULL DEFAULT 0,
  "status" varchar NOT NULL DEFAULT 'pending',
  "notes" text,
  "created_at" timestamp NOT NULL DEFAULT NOW()
);

-- Add foreign key constraints
ALTER TABLE "products" ADD CONSTRAINT "fk_product_group" FOREIGN KEY ("group_id") REFERENCES "product_groups" ("id") ON DELETE SET NULL;
ALTER TABLE "appointments" ADD CONSTRAINT "fk_appointment_customer" FOREIGN KEY ("customer_id") REFERENCES "customers" ("id");
ALTER TABLE "invoices" ADD CONSTRAINT "fk_invoice_customer" FOREIGN KEY ("customer_id") REFERENCES "customers" ("id");
ALTER TABLE "purchase_orders" ADD CONSTRAINT "fk_purchase_order_supplier" FOREIGN KEY ("supplier_id") REFERENCES "suppliers" ("id");

-- Insert default admin user
INSERT INTO users (username, password, name, role)
VALUES ('admin', '$2b$10$eFP8kKU6PlyL5mZPKU7u8O2ck5Z2s2exA1wIIbYj7ouAU5bvwz0l6', 'المدير', 'admin')
ON CONFLICT (username) DO NOTHING;

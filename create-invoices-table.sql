
DROP TABLE IF EXISTS invoices;

CREATE TABLE "invoices" (
  "id" SERIAL PRIMARY KEY,
  "customer_id" integer,
  "customer_name" text NOT NULL,
  "date" timestamp NOT NULL DEFAULT NOW(),
  "subtotal" text NOT NULL,
  "discount" text NOT NULL,
  "discount_amount" text NOT NULL,
  "final_total" text NOT NULL,
  "status" text NOT NULL,
  "created_at" timestamp NOT NULL DEFAULT NOW()
);

ALTER TABLE "invoices" ADD CONSTRAINT "fk_invoice_customer" FOREIGN KEY ("customer_id") REFERENCES "customers" ("id");

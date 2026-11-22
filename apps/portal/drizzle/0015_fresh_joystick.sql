CREATE TABLE IF NOT EXISTS "orders" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"created_at" timestamp with time zone,
	"order_pickup_at" timestamp with time zone,
	"order_number" text NOT NULL,
	"customer_name" text NOT NULL,
	"email" text,
	"item" text NOT NULL,
	"quantity" integer,
	"status" boolean,
	"verified_by" text
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "transactions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"created_at" timestamp with time zone,
	"date" date NOT NULL,
	"order_number" text NOT NULL,
	"order_id" uuid NOT NULL
);
--> statement-breakpoint
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE no action ON UPDATE no action;
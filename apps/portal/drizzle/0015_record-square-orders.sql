CREATE TABLE "orders" (
    "id" uuid NOT NULL,
    "created_at" timestamp with time zone DEFAULT now() NOT NULL,
    "order_pickup_at" timestamp with time zone DEFAULT now() NOT NULL,
    "order_number" text NOT NULL,
    "customer_name" text NOT NULL,
    "email" text,
    "item" text NOT NULL,
    "quantity" integer,
    "status" boolean,
    "verified_by" text NOT NULL
)
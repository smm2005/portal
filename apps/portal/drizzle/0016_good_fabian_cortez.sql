ALTER TABLE "orders" ADD COLUMN "square_order_id" text NOT NULL;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "square_line_item_id" text;--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_items_unique" UNIQUE("square_order_id","square_line_item_id");
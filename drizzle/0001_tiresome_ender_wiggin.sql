CREATE TABLE "device_status" (
	"device_id" uuid PRIMARY KEY NOT NULL,
	"online_status" boolean DEFAULT false,
	"last_transmission" timestamp,
	"error_codes" jsonb,
	"maintenance_count" integer DEFAULT 0,
	"battery_level" numeric(3, 1),
	"signal_strength" integer,
	"last_synced_at" timestamp DEFAULT now() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "devices" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"device_code" text NOT NULL,
	"location" text,
	"installation_date" timestamp,
	"status" text DEFAULT 'active',
	"firmware_version" text,
	"last_seen" timestamp,
	"user_id" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "devices_device_code_unique" UNIQUE("device_code")
);
--> statement-breakpoint
CREATE TABLE "telemetry_data" (
	"id" serial PRIMARY KEY NOT NULL,
	"device_id" uuid NOT NULL,
	"timestamp" timestamp DEFAULT now() NOT NULL,
	"wind_speed" numeric(5, 2),
	"wind_direction" integer,
	"temperature" numeric(4, 2),
	"humidity" numeric(4, 2),
	"battery_level" numeric(3, 1),
	"signal_strength" integer,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "device_status" ADD CONSTRAINT "device_status_device_id_devices_id_fk" FOREIGN KEY ("device_id") REFERENCES "public"."devices"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "devices" ADD CONSTRAINT "devices_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "telemetry_data" ADD CONSTRAINT "telemetry_data_device_id_devices_id_fk" FOREIGN KEY ("device_id") REFERENCES "public"."devices"("id") ON DELETE cascade ON UPDATE no action;
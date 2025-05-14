-- CreateEnum
CREATE TYPE "SubscriptionStatus" AS ENUM ('TRIALING', 'ACTIVE', 'LAPSED', 'CANCELLED', 'FREE_TIER_POST_TRIAL');

-- CreateEnum
CREATE TYPE "DashboardType" AS ENUM ('PERSONAL_GROWTH', 'RELATIONSHIPS');

-- CreateEnum
CREATE TYPE "MessageRole" AS ENUM ('USER', 'ASSISTANT');

-- Add soft delete columns
ALTER TABLE "User" ADD COLUMN "deleted_at" TIMESTAMP(3);
ALTER TABLE "BirthProfile" ADD COLUMN "deleted_at" TIMESTAMP(3);
ALTER TABLE "ChatThread" ADD COLUMN "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE "ChatThread" ADD COLUMN "deleted_at" TIMESTAMP(3);

-- Add constraints on coordinates
ALTER TABLE "BirthProfile" ADD CONSTRAINT "BirthProfile_latitude_check" 
  CHECK (birth_latitude >= -90.0 AND birth_latitude <= 90.0);
  
ALTER TABLE "BirthProfile" ADD CONSTRAINT "BirthProfile_longitude_check" 
  CHECK (birth_longitude >= -180.0 AND birth_longitude <= 180.0);

-- Add indexes
CREATE INDEX "User_subscription_status_idx" ON "User"("subscription_status");
CREATE INDEX "User_deleted_at_idx" ON "User"("deleted_at");

CREATE INDEX "BirthProfile_user_clerk_id_idx" ON "BirthProfile"("user_clerk_id");
CREATE INDEX "BirthProfile_date_of_birth_idx" ON "BirthProfile"("date_of_birth");
CREATE INDEX "BirthProfile_created_at_idx" ON "BirthProfile"("created_at");
CREATE INDEX "BirthProfile_deleted_at_idx" ON "BirthProfile"("deleted_at");

CREATE INDEX "ChatThread_user_clerk_id_idx" ON "ChatThread"("user_clerk_id");
CREATE INDEX "ChatThread_last_message_at_idx" ON "ChatThread"("last_message_at");
CREATE INDEX "ChatThread_created_at_idx" ON "ChatThread"("created_at");
CREATE INDEX "ChatThread_deleted_at_idx" ON "ChatThread"("deleted_at");

-- Create ChatMessage table
CREATE TABLE "ChatMessage" (
    "id" UUID NOT NULL,
    "thread_id" UUID NOT NULL,
    "content" TEXT NOT NULL,
    "role" "MessageRole" NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ChatMessage_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "ChatMessage_thread_id_created_at_idx" ON "ChatMessage"("thread_id", "created_at");

-- Add foreign key constraints
ALTER TABLE "ChatMessage" ADD CONSTRAINT "ChatMessage_thread_id_fkey" FOREIGN KEY ("thread_id") REFERENCES "ChatThread"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Convert existing subscription_status strings to enum
UPDATE "User" SET "subscription_status" = 'TRIALING' WHERE "subscription_status" = 'trialing';
UPDATE "User" SET "subscription_status" = 'ACTIVE' WHERE "subscription_status" = 'active';
UPDATE "User" SET "subscription_status" = 'LAPSED' WHERE "subscription_status" = 'lapsed';
UPDATE "User" SET "subscription_status" = 'CANCELLED' WHERE "subscription_status" = 'cancelled';
UPDATE "User" SET "subscription_status" = 'FREE_TIER_POST_TRIAL' WHERE "subscription_status" = 'free_tier_post_trial';

-- Convert existing dashboard context strings to enum
UPDATE "ChatThread" SET "active_dashboard_context" = 'PERSONAL_GROWTH' WHERE "active_dashboard_context" = 'personal_growth';
UPDATE "ChatThread" SET "active_dashboard_context" = 'RELATIONSHIPS' WHERE "active_dashboard_context" = 'relationships';

-- Alter User.subscription_status to use enum
ALTER TABLE "User" ALTER COLUMN "subscription_status" TYPE "SubscriptionStatus" USING "subscription_status"::"SubscriptionStatus";

-- Alter ChatThread.active_dashboard_context to use enum
ALTER TABLE "ChatThread" ALTER COLUMN "active_dashboard_context" TYPE "DashboardType" USING "active_dashboard_context"::"DashboardType";
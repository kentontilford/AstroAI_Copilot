-- Create User Role Enum Type
CREATE TYPE "UserRole" AS ENUM ('user', 'admin', 'moderator', 'support');

-- Add role column to User table with default value 'user'
ALTER TABLE "User" ADD COLUMN "role" "UserRole" NOT NULL DEFAULT 'user';

-- Add indexes for role-based queries
CREATE INDEX "idx_user_role" ON "User"("role");

-- Create table for permission tracking (for future fine-grained permissions)
CREATE TABLE "UserPermission" (
    "id" SERIAL NOT NULL,
    "user_clerk_id" TEXT NOT NULL,
    "permission" TEXT NOT NULL,
    "granted_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "granted_by" TEXT,
    "expires_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "UserPermission_pkey" PRIMARY KEY ("id")
);

-- Add foreign key constraint
ALTER TABLE "UserPermission" ADD CONSTRAINT "UserPermission_user_clerk_id_fkey" FOREIGN KEY ("user_clerk_id") REFERENCES "User"("clerk_user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Create unique constraint on user_clerk_id and permission
CREATE UNIQUE INDEX "UserPermission_user_clerk_id_permission_key" ON "UserPermission"("user_clerk_id", "permission") WHERE "deleted_at" IS NULL;

-- Add session tracking for improved security and auditing
CREATE TABLE "UserSession" (
    "id" SERIAL NOT NULL,
    "user_clerk_id" TEXT NOT NULL,
    "session_id" TEXT NOT NULL,
    "ip_address" TEXT,
    "user_agent" TEXT,
    "last_active" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "revoked_at" TIMESTAMP(3),
    "revoked_reason" TEXT,

    CONSTRAINT "UserSession_pkey" PRIMARY KEY ("id")
);

-- Add foreign key constraint
ALTER TABLE "UserSession" ADD CONSTRAINT "UserSession_user_clerk_id_fkey" FOREIGN KEY ("user_clerk_id") REFERENCES "User"("clerk_user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Create unique constraint on session_id
CREATE UNIQUE INDEX "UserSession_session_id_key" ON "UserSession"("session_id");

-- Add index on user_clerk_id and last_active for performance
CREATE INDEX "idx_user_session_user_last_active" ON "UserSession"("user_clerk_id", "last_active");

-- Create audit log table for security events
CREATE TABLE "AuditLog" (
    "id" SERIAL NOT NULL,
    "user_clerk_id" TEXT,
    "event_type" TEXT NOT NULL,
    "resource_type" TEXT,
    "resource_id" TEXT,
    "ip_address" TEXT,
    "user_agent" TEXT,
    "details" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- Add foreign key constraint (optional to allow logging events without users)
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_user_clerk_id_fkey" FOREIGN KEY ("user_clerk_id") REFERENCES "User"("clerk_user_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Add index on event_type and created_at for common queries
CREATE INDEX "idx_audit_log_event_created" ON "AuditLog"("event_type", "created_at");
CREATE INDEX "idx_audit_log_user_created" ON "AuditLog"("user_clerk_id", "created_at");
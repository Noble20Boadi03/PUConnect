-- This migration safely updates the users table to use OTP instead of password reset tokens

DO $$
BEGIN
    -- Drop old password reset columns if they exist
    IF EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'users' 
        AND column_name IN ('passwordResetToken', 'passwordResetExpires')
    ) THEN
        ALTER TABLE "users" 
        DROP COLUMN IF EXISTS "passwordResetToken",
        DROP COLUMN IF EXISTS "passwordResetExpires";
    END IF;

    -- Add new OTP columns if they don't exist
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'users' 
        AND column_name IN ('otpCode', 'otpExpires')
    ) THEN
        ALTER TABLE "users" 
        ADD COLUMN IF NOT EXISTS "otpCode" TEXT,
        ADD COLUMN IF NOT EXISTS "otpExpires" TIMESTAMP(3);
    END IF;
END
$$;

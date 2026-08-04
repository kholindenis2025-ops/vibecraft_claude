-- AlterTable
-- emailVerified defaults to true here so existing users (already trusted,
-- created before this feature existed) aren't locked out. The column default
-- is flipped to false immediately after, so all future inserts (new
-- registrations) require verification unless the app explicitly says otherwise.
ALTER TABLE "User" ADD COLUMN     "emailVerified" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "verificationAttempts" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "verificationCodeExpiresAt" TIMESTAMP(3),
ADD COLUMN     "verificationCodeHash" TEXT,
ADD COLUMN     "verificationCodeSentAt" TIMESTAMP(3);

ALTER TABLE "User" ALTER COLUMN "emailVerified" SET DEFAULT false;

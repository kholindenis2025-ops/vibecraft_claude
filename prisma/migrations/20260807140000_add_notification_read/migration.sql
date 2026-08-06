-- CreateTable
CREATE TABLE "NotificationRead" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "notificationId" TEXT NOT NULL,
    "readAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "NotificationRead_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "NotificationRead" ADD CONSTRAINT "NotificationRead_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NotificationRead" ADD CONSTRAINT "NotificationRead_notificationId_fkey" FOREIGN KEY ("notificationId") REFERENCES "Notification"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Backfill: preserve existing "already seen" state from NotificationState
-- (single lastSeenAt timestamp per user) as per-notification read rows,
-- so switching to per-item read tracking doesn't resurface old items as
-- unread for everyone.
INSERT INTO "NotificationRead" ("id", "userId", "notificationId", "readAt")
SELECT gen_random_uuid()::text, ns."userId", n."id", ns."lastSeenAt"
FROM "NotificationState" ns
JOIN "Notification" n ON n."createdAt" <= ns."lastSeenAt";

-- CreateIndex
CREATE UNIQUE INDEX "NotificationRead_userId_notificationId_key" ON "NotificationRead"("userId", "notificationId");

-- DropForeignKey
ALTER TABLE "NotificationState" DROP CONSTRAINT "NotificationState_userId_fkey";

-- DropTable
DROP TABLE "NotificationState";

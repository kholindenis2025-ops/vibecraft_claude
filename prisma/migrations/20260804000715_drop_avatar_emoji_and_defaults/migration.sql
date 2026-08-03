-- AlterTable
ALTER TABLE "Achievement" ALTER COLUMN "icon" SET DEFAULT 'trophy';

-- AlterTable
ALTER TABLE "Module" ALTER COLUMN "icon" SET DEFAULT 'compass';

-- AlterTable
ALTER TABLE "User" DROP COLUMN "avatarEmoji";

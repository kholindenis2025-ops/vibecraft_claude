-- CreateEnum
CREATE TYPE "ModuleCategory" AS ENUM ('INTRO', 'MODULE', 'TOOL', 'BONUS', 'MATERIAL');

-- AlterTable
ALTER TABLE "Module" ADD COLUMN     "category" "ModuleCategory" NOT NULL DEFAULT 'MODULE';

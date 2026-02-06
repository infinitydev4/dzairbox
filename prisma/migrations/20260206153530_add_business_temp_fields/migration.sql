-- AlterTable
ALTER TABLE "Business" ADD COLUMN     "tempExpiresAt" TIMESTAMP(3),
ADD COLUMN     "tempToken" TEXT,
ALTER COLUMN "userId" DROP NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Business_tempToken_key" ON "Business"("tempToken");

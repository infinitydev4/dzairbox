-- AlterTable
ALTER TABLE "Business" ADD COLUMN     "communeCode" TEXT,
ADD COLUMN     "location" JSONB,
ADD COLUMN     "moderationReason" TEXT,
ADD COLUMN     "moderationStatus" TEXT NOT NULL DEFAULT 'PENDING',
ADD COLUMN     "primaryLanguage" TEXT NOT NULL DEFAULT 'fr',
ADD COLUMN     "profileDraft" JSONB,
ADD COLUMN     "profileRevision" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "searchText" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "wilayaCode" TEXT;

-- AlterTable
ALTER TABLE "BusinessPageConfig" ADD COLUMN     "revision" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "submitted" JSONB,
ADD COLUMN     "submittedAt" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "BusinessMedia" (
    "id" TEXT NOT NULL,
    "businessId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "storageUrl" TEXT NOT NULL,
    "contentType" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BusinessMedia_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BusinessEvent" (
    "id" TEXT NOT NULL,
    "businessId" TEXT,
    "kind" TEXT NOT NULL,
    "day" DATE NOT NULL,
    "count" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "BusinessEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "BusinessMedia_businessId_idx" ON "BusinessMedia"("businessId");

-- CreateIndex
CREATE INDEX "BusinessEvent_businessId_day_idx" ON "BusinessEvent"("businessId", "day");

-- CreateIndex
CREATE UNIQUE INDEX "BusinessEvent_businessId_kind_day_key" ON "BusinessEvent"("businessId", "kind", "day");

-- CreateIndex
CREATE INDEX "Business_moderationStatus_wilayaCode_communeCode_idx" ON "Business"("moderationStatus", "wilayaCode", "communeCode");

-- AddForeignKey
ALTER TABLE "BusinessMedia" ADD CONSTRAINT "BusinessMedia_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BusinessMedia" ADD CONSTRAINT "BusinessMedia_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BusinessEvent" ADD CONSTRAINT "BusinessEvent_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE CASCADE ON UPDATE CASCADE;


-- Existing public businesses remain approved; no URL or published page changes.
UPDATE "Business" SET "moderationStatus" = 'APPROVED' WHERE "isActive" = true;
UPDATE "Business" SET "searchText" = lower(concat_ws(' ', "name", "category", "address", "description", "services"));

-- AlterTable
ALTER TABLE "Business" ADD COLUMN     "templateId" TEXT,
ADD COLUMN     "useCustomPage" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "Template" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "version" TEXT NOT NULL DEFAULT '1.0',
    "schema" JSONB NOT NULL,
    "preview" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Template_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BusinessPageConfig" (
    "id" TEXT NOT NULL,
    "businessId" TEXT NOT NULL,
    "config" JSONB NOT NULL,
    "draft" JSONB,
    "configVersion" INTEGER NOT NULL DEFAULT 1,
    "publishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BusinessPageConfig_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Template_key_key" ON "Template"("key");

-- CreateIndex
CREATE UNIQUE INDEX "BusinessPageConfig_businessId_key" ON "BusinessPageConfig"("businessId");

-- CreateIndex
CREATE INDEX "BusinessPageConfig_businessId_idx" ON "BusinessPageConfig"("businessId");

-- AddForeignKey
ALTER TABLE "Business" ADD CONSTRAINT "Business_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "Template"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BusinessPageConfig" ADD CONSTRAINT "BusinessPageConfig_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE CASCADE ON UPDATE CASCADE;

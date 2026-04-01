-- AlterTable
ALTER TABLE "User" ADD COLUMN "apiKeys" TEXT;
ALTER TABLE "User" ADD COLUMN "notificationPreferences" TEXT;
ALTER TABLE "User" ADD COLUMN "privacySettings" TEXT;
ALTER TABLE "User" ADD COLUMN "securitySettings" TEXT;

-- CreateTable
CREATE TABLE "AIArtifact" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "prompt" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "metadata" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "AIArtifact_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

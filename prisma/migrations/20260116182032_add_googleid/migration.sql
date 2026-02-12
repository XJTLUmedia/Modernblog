-- AlterTable
ALTER TABLE "Post" ADD COLUMN "mnemonics" TEXT;
ALTER TABLE "Post" ADD COLUMN "recallQuestions" TEXT;

-- AlterTable
ALTER TABLE "Project" ADD COLUMN "mnemonics" TEXT;
ALTER TABLE "Project" ADD COLUMN "recallQuestions" TEXT;
ALTER TABLE "Project" ADD COLUMN "studyChunks" TEXT;

-- CreateTable
CREATE TABLE "SiteSettings" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT 'site-config',
    "siteName" TEXT NOT NULL DEFAULT 'Antigravity OS',
    "siteDescription" TEXT NOT NULL DEFAULT 'Neural-link optimized intellectual forge.',
    "memorizationMode" BOOLEAN NOT NULL DEFAULT true,
    "activeRecall" BOOLEAN NOT NULL DEFAULT true,
    "spacedRepetition" BOOLEAN NOT NULL DEFAULT true,
    "themeColor" TEXT NOT NULL DEFAULT '#10b981',
    "githubUrl" TEXT,
    "twitterUrl" TEXT,
    "birthday" DATETIME,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Badge" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "icon" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "UserBadge" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "badgeId" TEXT NOT NULL,
    "assignedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "UserBadge_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "UserBadge_badgeId_fkey" FOREIGN KEY ("badgeId") REFERENCES "Badge" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Bookmark" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "postId" TEXT,
    "gardenNoteId" TEXT,
    "projectId" TEXT,
    CONSTRAINT "Bookmark_postId_fkey" FOREIGN KEY ("postId") REFERENCES "Post" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Bookmark_gardenNoteId_fkey" FOREIGN KEY ("gardenNoteId") REFERENCES "GardenNote" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Bookmark_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Bookmark_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_GardenNote" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'seedling',
    "summary" TEXT,
    "lastReviewed" DATETIME,
    "nextReview" DATETIME,
    "reviewInterval" INTEGER NOT NULL DEFAULT 1,
    "recallQuestions" TEXT,
    "links" TEXT,
    "viewCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "authorId" TEXT NOT NULL,
    CONSTRAINT "GardenNote_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_GardenNote" ("authorId", "content", "createdAt", "id", "links", "slug", "status", "summary", "title", "updatedAt", "viewCount") SELECT "authorId", "content", "createdAt", "id", "links", "slug", "status", "summary", "title", "updatedAt", "viewCount" FROM "GardenNote";
DROP TABLE "GardenNote";
ALTER TABLE "new_GardenNote" RENAME TO "GardenNote";
CREATE UNIQUE INDEX "GardenNote_slug_key" ON "GardenNote"("slug");
CREATE TABLE "new_User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "password" TEXT,
    "googleId" TEXT,
    "name" TEXT,
    "avatar" TEXT,
    "bio" TEXT,
    "website" TEXT,
    "resetToken" TEXT,
    "resetTokenExpires" DATETIME,
    "role" TEXT NOT NULL DEFAULT 'user',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_User" ("bio", "createdAt", "email", "id", "name", "password", "resetToken", "resetTokenExpires", "role", "updatedAt", "website") SELECT "bio", "createdAt", "email", "id", "name", "password", "resetToken", "resetTokenExpires", "role", "updatedAt", "website" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
CREATE UNIQUE INDEX "User_googleId_key" ON "User"("googleId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "Badge_name_key" ON "Badge"("name");

-- CreateIndex
CREATE UNIQUE INDEX "UserBadge_userId_badgeId_key" ON "UserBadge"("userId", "badgeId");

-- CreateIndex
CREATE UNIQUE INDEX "Bookmark_userId_postId_key" ON "Bookmark"("userId", "postId");

-- CreateIndex
CREATE UNIQUE INDEX "Bookmark_userId_gardenNoteId_key" ON "Bookmark"("userId", "gardenNoteId");

-- CreateIndex
CREATE UNIQUE INDEX "Bookmark_userId_projectId_key" ON "Bookmark"("userId", "projectId");

-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "resetToken" TEXT,
    "resetTokenExpiry" TIMESTAMP(3),

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Post" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "published" BOOLEAN NOT NULL DEFAULT false,
    "pinned" BOOLEAN NOT NULL DEFAULT false,
    "archived" BOOLEAN NOT NULL DEFAULT false,
    "views" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "Post_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Tag" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Tag_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PostTag" (
    "postId" INTEGER NOT NULL,
    "tagId" INTEGER NOT NULL,

    CONSTRAINT "PostTag_pkey" PRIMARY KEY ("postId","tagId")
);

-- CreateTable
CREATE TABLE "Settings" (
    "id" SERIAL NOT NULL,
    "siteName" TEXT NOT NULL DEFAULT 'Blackout',
    "description" TEXT NOT NULL DEFAULT 'Welcome to Blackout',
    "aboutContent" TEXT NOT NULL DEFAULT '# **Blackout** – a sleek, developer-friendly blogging platform built with **Next.js** for fast, modern, and minimalistic content creation.',
    "metaTitle" TEXT NOT NULL DEFAULT 'Blackout',
    "metaDescription" TEXT NOT NULL DEFAULT 'Welcome to Blackout',
    "metaKeywords" TEXT NOT NULL DEFAULT '',
    "ogTitle" TEXT NOT NULL DEFAULT 'Blackout',
    "ogDescription" TEXT NOT NULL DEFAULT 'Welcome to Blackout',
    "ogImage" TEXT NOT NULL DEFAULT '',
    "twitterCard" TEXT NOT NULL DEFAULT 'summary_large_image',
    "twitterSite" TEXT NOT NULL DEFAULT '',
    "sitemapEnabled" BOOLEAN NOT NULL DEFAULT true,
    "robotsTxt" TEXT NOT NULL DEFAULT 'User-agent: *\nAllow: /',
    "googleAnalyticsId" TEXT NOT NULL DEFAULT '',
    "privacyPolicy" TEXT NOT NULL DEFAULT '',
    "contactEmail" TEXT NOT NULL DEFAULT 'rainielmontanez@dex-server.space',
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "smtpHost" TEXT NOT NULL DEFAULT 'smtp.gmail.com',
    "smtpPort" INTEGER NOT NULL DEFAULT 587,
    "smtpUser" TEXT NOT NULL DEFAULT 'your-email@gmail.com',
    "smtpPassword" TEXT NOT NULL DEFAULT 'yourpassword',
    "smtpSecure" BOOLEAN NOT NULL DEFAULT false,
    "smtpFromEmail" TEXT NOT NULL DEFAULT 'your-email@gmail.com',

    CONSTRAINT "Settings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Post_slug_key" ON "Post"("slug");

-- CreateIndex
CREATE INDEX "Post_published_archived_createdAt_idx" ON "Post"("published", "archived", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "Post_pinned_published_idx" ON "Post"("pinned", "published");

-- CreateIndex
CREATE INDEX "Post_slug_idx" ON "Post"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Tag_name_key" ON "Tag"("name");

-- CreateIndex
CREATE INDEX "Tag_name_idx" ON "Tag"("name");

-- AddForeignKey
ALTER TABLE "PostTag" ADD CONSTRAINT "PostTag_postId_fkey" FOREIGN KEY ("postId") REFERENCES "Post"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PostTag" ADD CONSTRAINT "PostTag_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "Tag"("id") ON DELETE CASCADE ON UPDATE CASCADE;

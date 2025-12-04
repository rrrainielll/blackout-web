-- AlterTable
ALTER TABLE "Settings" ADD COLUMN     "googleAnalyticsId" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "metaDescription" TEXT NOT NULL DEFAULT 'Welcome to Blackout',
ADD COLUMN     "metaKeywords" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "metaTitle" TEXT NOT NULL DEFAULT 'Blackout',
ADD COLUMN     "ogDescription" TEXT NOT NULL DEFAULT 'Welcome to Blackout',
ADD COLUMN     "ogImage" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "ogTitle" TEXT NOT NULL DEFAULT 'Blackout',
ADD COLUMN     "robotsTxt" TEXT NOT NULL DEFAULT 'User-agent: *\nAllow: /',
ADD COLUMN     "sitemapEnabled" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "twitterCard" TEXT NOT NULL DEFAULT 'summary_large_image',
ADD COLUMN     "twitterSite" TEXT NOT NULL DEFAULT '';

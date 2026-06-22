-- Rename ExploreCategoryId enum values in place (preserves FK constraints)
ALTER TYPE "ExploreCategoryId" RENAME VALUE 'tutoring' TO 'academics';
ALTER TYPE "ExploreCategoryId" RENAME VALUE 'tech' TO 'tech_creative';
ALTER TYPE "ExploreCategoryId" RENAME VALUE 'design' TO 'media';
ALTER TYPE "ExploreCategoryId" RENAME VALUE 'career' TO 'business_career';
ALTER TYPE "ExploreCategoryId" RENAME VALUE 'campus' TO 'campus_lifestyle';

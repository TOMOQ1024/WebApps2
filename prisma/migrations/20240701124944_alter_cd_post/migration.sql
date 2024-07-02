/*
  Warnings:

  - Added the required column `author_id` to the `cd_post` table without a default value. This is not possible if the table is not empty.
  - Added the required column `origin_x` to the `cd_post` table without a default value. This is not possible if the table is not empty.
  - Added the required column `origin_y` to the `cd_post` table without a default value. This is not possible if the table is not empty.
  - Added the required column `radius` to the `cd_post` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "cd_post" ADD COLUMN     "author_id" INTEGER NOT NULL,
ADD COLUMN     "origin_x" TEXT NOT NULL,
ADD COLUMN     "origin_y" TEXT NOT NULL,
ADD COLUMN     "radius" TEXT NOT NULL;

-- CreateIndex
CREATE INDEX "cd_post_author_id_idx" ON "cd_post"("author_id");

-- AddForeignKey
ALTER TABLE "cd_post" ADD CONSTRAINT "cd_post_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

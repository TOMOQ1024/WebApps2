/*
  Warnings:

  - The primary key for the `CompDynamPostTag` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `postId` on the `CompDynamPostTag` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[compDynamPostId,tagId]` on the table `CompDynamPostTag` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `compDynamPostId` to the `CompDynamPostTag` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "CompDynamPostTag" DROP CONSTRAINT "CompDynamPostTag_postId_fkey";

-- DropForeignKey
ALTER TABLE "CompDynamPostTag" DROP CONSTRAINT "CompDynamPostTag_tagId_fkey";

-- DropIndex
DROP INDEX "CompDynamPostTag_postId_idx";

-- DropIndex
DROP INDEX "CompDynamPostTag_tagId_idx";

-- AlterTable
ALTER TABLE "CompDynamPostTag" DROP CONSTRAINT "CompDynamPostTag_pkey",
DROP COLUMN "postId",
ADD COLUMN     "compDynamPostId" INTEGER NOT NULL,
ADD COLUMN     "id" SERIAL NOT NULL,
ADD CONSTRAINT "CompDynamPostTag_pkey" PRIMARY KEY ("id");

-- CreateTable
CREATE TABLE "App" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "path" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "App_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AppTag" (
    "id" SERIAL NOT NULL,
    "appId" INTEGER NOT NULL,
    "tagId" INTEGER NOT NULL,

    CONSTRAINT "AppTag_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AppTag_appId_tagId_key" ON "AppTag"("appId", "tagId");

-- CreateIndex
CREATE UNIQUE INDEX "CompDynamPostTag_compDynamPostId_tagId_key" ON "CompDynamPostTag"("compDynamPostId", "tagId");

-- AddForeignKey
ALTER TABLE "CompDynamPostTag" ADD CONSTRAINT "CompDynamPostTag_compDynamPostId_fkey" FOREIGN KEY ("compDynamPostId") REFERENCES "CompDynamPost"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CompDynamPostTag" ADD CONSTRAINT "CompDynamPostTag_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "Tag"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AppTag" ADD CONSTRAINT "AppTag_appId_fkey" FOREIGN KEY ("appId") REFERENCES "App"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AppTag" ADD CONSTRAINT "AppTag_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "Tag"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

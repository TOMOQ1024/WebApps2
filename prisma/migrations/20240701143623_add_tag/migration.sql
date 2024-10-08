/*
  Warnings:

  - You are about to drop the `cd_post` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `user` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "cd_post" DROP CONSTRAINT "cd_post_author_id_fkey";

-- DropTable
DROP TABLE "cd_post";

-- DropTable
DROP TABLE "user";

-- CreateTable
CREATE TABLE "CompDynamPost" (
    "id" SERIAL NOT NULL,
    "authorId" INTEGER NOT NULL,
    "expression" TEXT NOT NULL,
    "radius" TEXT NOT NULL,
    "originX" TEXT NOT NULL,
    "originY" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CompDynamPost_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Tag" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Tag_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CompDynamPostTag" (
    "postId" INTEGER NOT NULL,
    "tagId" INTEGER NOT NULL,

    CONSTRAINT "CompDynamPostTag_pkey" PRIMARY KEY ("postId","tagId")
);

-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "passhash" TEXT NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CompDynamPost_authorId_idx" ON "CompDynamPost"("authorId");

-- CreateIndex
CREATE UNIQUE INDEX "Tag_name_key" ON "Tag"("name");

-- CreateIndex
CREATE INDEX "CompDynamPostTag_postId_idx" ON "CompDynamPostTag"("postId");

-- CreateIndex
CREATE INDEX "CompDynamPostTag_tagId_idx" ON "CompDynamPostTag"("tagId");

-- AddForeignKey
ALTER TABLE "CompDynamPost" ADD CONSTRAINT "CompDynamPost_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CompDynamPostTag" ADD CONSTRAINT "CompDynamPostTag_postId_fkey" FOREIGN KEY ("postId") REFERENCES "CompDynamPost"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CompDynamPostTag" ADD CONSTRAINT "CompDynamPostTag_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "Tag"("id") ON DELETE CASCADE ON UPDATE CASCADE;

/*
  Warnings:

  - Added the required column `z0Expression` to the `CompDynamPost` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "CompDynamPost" ADD COLUMN     "z0Expression" TEXT NOT NULL;

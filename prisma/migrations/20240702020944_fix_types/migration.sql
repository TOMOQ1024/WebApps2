/*
  Warnings:

  - Changed the type of `radius` on the `CompDynamPost` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `originX` on the `CompDynamPost` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `originY` on the `CompDynamPost` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "CompDynamPost" DROP COLUMN "radius",
ADD COLUMN     "radius" DOUBLE PRECISION NOT NULL,
DROP COLUMN "originX",
ADD COLUMN     "originX" DOUBLE PRECISION NOT NULL,
DROP COLUMN "originY",
ADD COLUMN     "originY" DOUBLE PRECISION NOT NULL;

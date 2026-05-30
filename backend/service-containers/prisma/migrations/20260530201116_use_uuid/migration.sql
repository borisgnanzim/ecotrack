/*
  Warnings:

  - The primary key for the `FillHistory` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `conteneur` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - Changed the type of `id` on the `FillHistory` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `conteneurId` on the `FillHistory` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `id_conteneur` on the `conteneur` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- DropForeignKey
ALTER TABLE "FillHistory" DROP CONSTRAINT "FillHistory_conteneurId_fkey";

-- AlterTable
ALTER TABLE "FillHistory" DROP CONSTRAINT "FillHistory_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" UUID NOT NULL,
DROP COLUMN "conteneurId",
ADD COLUMN     "conteneurId" UUID NOT NULL,
ADD CONSTRAINT "FillHistory_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "conteneur" DROP CONSTRAINT "conteneur_pkey",
DROP COLUMN "id_conteneur",
ADD COLUMN     "id_conteneur" UUID NOT NULL,
ADD CONSTRAINT "conteneur_pkey" PRIMARY KEY ("id_conteneur");

-- AddForeignKey
ALTER TABLE "FillHistory" ADD CONSTRAINT "FillHistory_conteneurId_fkey" FOREIGN KEY ("conteneurId") REFERENCES "conteneur"("id_conteneur") ON DELETE CASCADE ON UPDATE CASCADE;

-- CreateTable
CREATE TABLE "conteneur" (
    "id_conteneur" SERIAL NOT NULL,
    "type_Dechet" TEXT NOT NULL,
    "Statut" TEXT,
    "id_Zone" TEXT NOT NULL,
    "capacite_i" INTEGER,
    "code_conteneur" INTEGER NOT NULL,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "photo_url" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "conteneur_pkey" PRIMARY KEY ("id_conteneur")
);

-- CreateTable
CREATE TABLE "FillHistory" (
    "id" SERIAL NOT NULL,
    "niveau" INTEGER NOT NULL,
    "recordedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "conteneurId" INTEGER NOT NULL,

    CONSTRAINT "FillHistory_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "conteneur_code_conteneur_key" ON "conteneur"("code_conteneur");

-- AddForeignKey
ALTER TABLE "FillHistory" ADD CONSTRAINT "FillHistory_conteneurId_fkey" FOREIGN KEY ("conteneurId") REFERENCES "conteneur"("id_conteneur") ON DELETE CASCADE ON UPDATE CASCADE;

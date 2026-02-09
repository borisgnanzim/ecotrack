import { PrismaClient } from "@prisma/client";
import { stat } from "fs";

const prisma = new PrismaClient();

// Utils – Haversine
function haversine(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const toRad = (v) => (v * Math.PI) / 180;

  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) ** 2;

  return R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
}

export const createContainer = async (req, res) => {
  try {
    const conteneur = await prisma.conteneur.create({
      data: req.body,
    });
    res.status(201).json(conteneur);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

export const getAllContainers = async (req, res) => {
  const conteneurs = await prisma.conteneur.findMany();
  res.json(conteneurs);
};

export const getContainerById = async (req, res) => {
  const id = Number(req.params.id); // <- IMPORTANT
  if (isNaN(id) || id <= 0) {

 
    return res.status(400).json({ error: "id invalide" });
 }
  try {
    const cont = await prisma.conteneur.findUnique({
      where: { id_conteneur: id },
    });
    if (!cont) return res.status(404).json({ error: "Conteneur non trouvé" });
    res.json(cont);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


export const updateContainer = async (req, res) => {
  try {
    const cont = await prisma.conteneur.update({
      where: { id_conteneur: Number(req.params.id) },
      data: req.body,
    });

    // Émettre l’événement WebSocket
    const io = req.app.get("io");
    io.emit("container_updated", cont);

    res.json(cont);
  } catch (error) {
    res.status(500).json({ error: "Impossible de mettre à jour le conteneur" });
  }
};

export const getStats = async (req, res) => {
  try {
    const conteneurs = await prisma.conteneur.findMany();

    const total = conteneurs.length;
    const parType = {};
    const statusCount = {};
    let totalCapacity = 0;
    let totalFillLevel = 0; // si tu as un champ fill_level

    conteneurs.forEach((c) => {
      // par type
      parType[c.type_Dechet] = (parType[c.type_Dechet] || 0) + 1;

      // par statut
      if (c.Statut) statusCount[c.Statut] = (statusCount[c.Statut] || 0) + 1;

      // capacité
      if (c.capacité_i) totalCapacity += c.capacité_i;

      // fill_level si existant
      if (c.fill_level) totalFillLevel += c.fill_level;
    });

    res.json({
      total,
      parType,
      statusCount,
      totalCapacity,
      averageFillLevel:
        totalFillLevel && total > 0 ? totalFillLevel / total : null,
    });
  } catch (error) {
    res.status(500).json({ error: "Impossible de calculer les statistiques" });
  }
};


export const deleteContainer = async (req, res) => {
  await prisma.conteneur.delete({
    where: { id_conteneur: Number(req.params.id) },
  });
  res.json({
    status: "success",
    message: "Supprimé"
});

};

export const getNearbyContainers = async (req, res) => {
  const { lat, lng, radius } = req.query;

  const conteneurs = await prisma.conteneur.findMany();

  const result = conteneurs.filter((c) => {
    if (!c.latitude || !c.longitude) return false;
    return (
      haversine(
        Number(lat),
        Number(lng),
        c.latitude,
        c.longitude
      ) <= Number(radius)
    );
  });

  res.json(result);
};

export const uploadPhoto = async (req, res) => {
  const cont = await prisma.conteneur.update({
    where: { id_conteneur: Number(req.params.id) },
    data: { photo_url: `/uploads/${req.file.filename}` },
  });
  res.json(cont);
};

// POST /containers/:id/fill-history
export const addFillHistory = async (req, res) => {
  const conteneurId = parseInt(req.params.id);
  const { niveau } = req.body;

  if (isNaN(conteneurId) || niveau == null) {
    return res.status(400).json({ error: "Données invalides" });
  }

  try {
    // vérifier que le conteneur existe
    const conteneur = await prisma.conteneur.findUnique({
      where: { id_conteneur: conteneurId },
    });

    if (!conteneur) {
      return res.status(404).json({ error: "Conteneur introuvable" });
    }

    const history = await prisma.fillHistory.create({
      data: {
        conteneurId,
        niveau,
      },
    });

    res.status(201).json(history);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erreur serveur" });
  }
};
export const getFillHistory = async (req, res) => {
  const conteneurId = parseInt(req.params.id);

  if (isNaN(conteneurId)) {
    return res.status(400).json({ error: "ID invalide" });
  }

  try {
    const history = await prisma.fillHistory.findMany({
      where: { conteneurId },
      orderBy: { recordedAt : "desc" },
    });

    res.json(history);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erreur serveur" });
  }
};

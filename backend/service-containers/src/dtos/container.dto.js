// src/dtos/container.dto.js
import { z } from 'zod';

// Création d’un conteneur
export const CreateContainerDTO = z.object({
  type_Dechet: z.string().min(3),
  id_Zone: z.string().min(1),
  capacite_i: z.number().positive(),
  code_conteneur: z.number().optional(),
  latitude: z.number(),
  longitude: z.number(),
  Statut: z.string().optional(),
});

// Mise à jour d’un conteneur
export const UpdateContainerDTO = z.object({
  type_Dechet: z.string().min(3).optional(),
  id_Zone: z.string().min(1).optional(),
  capacite_i: z.number().positive().optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  Statut: z.string().optional(),
  code_conteneur: z.number().optional(),
});

export const ContainerIdDTO= z.object({
  id: z.coerce.number().int().positive(),
});
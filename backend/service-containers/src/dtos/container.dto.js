// src/dtos/container.dto.js
import { z } from 'zod';

// Création d’un conteneur
export const CreateContainerDTO = z.object({
  type: z.string().min(3, 'Type de déchet requis'),
  zoneId: z.string().uuid('Zone ID doit être un UUID'),
  capacity: z.number().positive('Capacité doit être positive'),
  code: z.number().int().positive('Code doit être un entier positif'),
  latitude: z.number().min(-90).max(90, 'Latitude invalide'),
  longitude: z.number().min(-180).max(180, 'Longitude invalide'),
  status: z.string().optional(),
});

// Mise à jour d’un conteneur
export const UpdateContainerDTO = z.object({
  type: z.string().min(3).optional(),
  zoneId: z.string().uuid().optional(),
  capacity: z.number().positive().optional(),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
  status: z.string().optional(),
  photoUrl: z.string().url().optional(),
});

export const ContainerIdDTO = z.object({
  id: z.string().uuid('Container ID doit être un UUID'),
});
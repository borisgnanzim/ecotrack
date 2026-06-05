// src/dtos/container.dto.js
import { z } from 'zod';

// Création d’un conteneur
export const CreateContainerDTO = z.object({
  type: z.string().min(3, 'Type de déchet requis'),
  zoneId: z.string().min(1, 'Zone ID requis'),
  capacity: z.coerce.number().positive('Capacité doit être positive'),
  code: z.number().int().positive('Code doit être un entier positif').optional(),
  fillLevel: z.coerce.number().int('fillLevel doit être un entier').min(0, 'fillLevel minimum 0').max(100, 'fillLevel maximum 100').optional(),
  latitude: z.coerce.number().min(-90, 'Latitude invalide').max(90, 'Latitude invalide'),
  longitude: z.coerce.number().min(-180, 'Longitude invalide').max(180, 'Longitude invalide'),
  status: z.string().optional(),
});

// Mise à jour d’un conteneur
export const UpdateContainerDTO = z.object({
  type: z.string().min(3).optional(),
  zoneId: z.string().min(1).optional(),
  capacity: z.coerce.number().positive().optional(),
  fillLevel: z.coerce.number().int('fillLevel doit être un entier').min(0, 'fillLevel minimum 0').max(100, 'fillLevel maximum 100').optional(),
  latitude: z.coerce.number().min(-90).max(90).optional(),
  longitude: z.coerce.number().min(-180).max(180).optional(),
  status: z.string().optional(),
  photoUrl: z.string().url().optional(),
});

export const ContainerIdDTO = z.object({
  id: z.string().uuid('Container ID doit être un UUID'),
});
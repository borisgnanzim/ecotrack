import { z } from 'zod';

const GeoJSONGeometry = z.object({
  type: z.enum(['Polygon', 'MultiPolygon']),
  coordinates: z.array(z.any()),
}).optional().nullable();

export const CreateZoneDTO = z.object({
  id: z.string().min(1, 'ID requis').max(50, 'ID trop long (50 chars max)'),
  name: z.string().min(2, 'Nom requis (min 2 caractères)'),
  city: z.string().min(1, 'Ville requise'),
  district: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  isActive: z.boolean().optional().default(true),
  polygon: GeoJSONGeometry,
  latitude: z.number().min(-90).max(90).optional().nullable(),
  longitude: z.number().min(-180).max(180).optional().nullable(),
});

export const UpdateZoneDTO = z.object({
  name: z.string().min(2).optional(),
  city: z.string().min(1).optional(),
  district: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  isActive: z.boolean().optional(),
  polygon: GeoJSONGeometry,
  latitude: z.number().min(-90).max(90).optional().nullable(),
  longitude: z.number().min(-180).max(180).optional().nullable(),
});

export const AssignContainersDTO = z.object({
  containerIds: z.array(z.string().uuid('UUID invalide')).min(1, 'Au moins un conteneur requis'),
});

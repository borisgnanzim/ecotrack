import { z } from 'zod';

export const createFillHistoryDTO = z.object({
  fillLevel: z
    .number({
      required_error: 'fillLevel est requis',
      invalid_type_error: 'fillLevel doit être un nombre',
    })
    .int('fillLevel doit être un entier')
    .min(0, 'fillLevel ne peut pas être négatif')
    .max(100, 'fillLevel ne peut pas dépasser 100'),
  recordedAt: z.date().optional(),
});

export const ContainerIdDTO = z.object({
  id: z.string().uuid('Container ID doit être un UUID'),
});
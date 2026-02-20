import { z } from "zod";

export const createFillHistoryDTO = z.object({
  niveau: z
    .number({
      required_error: "niveau est requis",
      invalid_type_error: "niveau doit être un nombre",
    })
    .min(0, "niveau ne peut pas être négatif")
    .max(100, "niveau ne peut pas dépasser 100"),
    recordedAt: z.date().optional(),
});

export const ContainerIdDTO= z.object({
    id: z.coerce.number().int().positive(),
})
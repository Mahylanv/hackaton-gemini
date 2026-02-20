import { z } from 'zod'

export const eventSchema = z.object({
  title: z.string().min(3, "Le titre est obligatoire"),
  description: z.string().min(10, "La description doit être plus détaillée"),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Format de date invalide"),
  start_time: z.string().regex(/^\d{2}:\d{2}$/, "Format d'heure invalide"),
  end_time: z.string().regex(/^\d{2}:\d{2}$/, "Format d'heure invalide"),
  type: z.string().min(2, "Le type est obligatoire"),
  location: z.string().min(2, "Le lieu est obligatoire"),
  image_url: z.string().optional(),
}).refine((data) => {
  return data.start_time < data.end_time;
}, {
  message: "L'heure de fin doit être après l'heure de début",
  path: ["end_time"],
})

export type EventInput = z.infer<typeof eventSchema>

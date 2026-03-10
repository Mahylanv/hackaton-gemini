import { z } from 'zod'

export const jobSchema = z.object({
  title: z.string().min(3, "Le titre doit faire au moins 3 caractères"),
  company: z.string().min(2, "Le nom de l'entreprise est obligatoire"),
  description: z.string().min(10, "La description doit être plus détaillée"),
  type: z.enum(['CDI', 'CDD', 'STAGE', 'ALTERNANCE', 'FREELANCE']),
  location: z.string().min(2, "Le lieu est obligatoire"),
  link: z.string().url("L'URL doit être valide").optional().or(z.literal('')),
})

export type JobInput = z.infer<typeof jobSchema>

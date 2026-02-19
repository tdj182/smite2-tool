import { z } from 'zod';

export const BuildRoleSchema = z.enum(['adc', 'mid', 'jungle', 'solo', 'support']);

export const BuildSchema = z.object({
  id: z.string().min(1).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  name: z.string().min(1),
  role: BuildRoleSchema,
  description: z.string().default(''),
  itemIds: z.array(z.string()),
  itemNotes: z.record(z.string(), z.string()).optional(),
  tags: z.array(z.string()).default([]),
  godIds: z.array(z.string()).default([]),
});

export const BuildsDataSchema = z.object({
  builds: z.array(BuildSchema),
}).refine(
  (data) => {
    const ids = data.builds.map((b) => b.id);
    return ids.length === new Set(ids).size;
  },
  { message: 'Build IDs must be unique' }
);

export type BuildRole = z.infer<typeof BuildRoleSchema>;
export type Build = z.infer<typeof BuildSchema>;
export type BuildsData = z.infer<typeof BuildsDataSchema>;

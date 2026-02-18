// src/lib/schemas/items.ts
import { z } from "zod";

/**
 * Keep these enums tight. If the game introduces a new category later,
 * you update it here and your app will surface what needs handling.
 */
export const ItemCategorySchema = z.enum([
  "item",
  "starter",
  "relic",
  "consumable",
  "curio",
  "mod",
]);

export const ItemEffectTypeSchema = z.enum(["passive", "active", "both", "none"]);

/**
 * v1 history: intentionally lightweight.
 * You can evolve this later without breaking the core item contract.
 */
export const ItemHistoryEntrySchema = z.object({
  patch: z.string().min(1),
  notes: z.string().min(1).optional(),
});

export const ItemIconSchema = z.object({
  // Prefer localPath for v1 to keep hosting simple.
  // Example: "/images/items/deathbringer.webp"
  localPath: z.string().min(1),
  alt: z.string().min(1),
});

export const ItemShopSchema = z.object({
  cost: z.number().int().nonnegative(),
  totalCost: z.number().int().nonnegative().nullable().optional(),
});

export const ItemClassificationSchema = z.object({
  tier: z.number().int().min(1).max(5).nullable(), // some categories may not have a tier
  category: ItemCategorySchema,
  effectType: ItemEffectTypeSchema,
});

/**
 * Flexible stats map. Keys should be stable "stat ids" you control.
 * Example keys: strength, intelligence, health, mana, attackSpeed, critChance, cooldownRate
 */
export const ItemStatsSchema = z.record(z.string(), z.number());

export const ItemDetailsSchema = z.object({
  summary: z.string().nullable(),
  passive: z.string().nullable(),
  active: z.string().nullable(),
  cooldownSeconds: z.number().int().nonnegative().nullable(),
});

export const ItemRelationshipsSchema = z.object({
  // IDs of other items
  buildsFrom: z.array(z.string().min(1)),
  buildsInto: z.array(z.string().min(1)),
  // God IDs (slugs) like "aladdin", "vulcan"
  restrictedToGodIds: z.array(z.string().min(1)),
});

export const ItemSchema = z.object({
  id: z
    .string()
    .min(1)
    // enforce slug-ish IDs (adjust if you want underscores)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "id must be a kebab-case slug"),
  name: z.string().min(1),

  icon: ItemIconSchema,
  shop: ItemShopSchema,
  classification: ItemClassificationSchema,

  stats: ItemStatsSchema,
  tags: z.array(z.string().min(1)),

  details: ItemDetailsSchema,
  relationships: ItemRelationshipsSchema,

  history: z.array(ItemHistoryEntrySchema),
});

export const ItemsMetaSchema = z.object({
  game: z.literal("smite2"),
  dataVersion: z.number().int().min(1),
  patch: z.string().min(1),
  // ISO string; if you want stricter, enforce via refine + Date.parse
  lastUpdatedUtc: z.string().min(1),
});

export const ItemsFileSchema = z.object({
  meta: ItemsMetaSchema,
  items: z.array(ItemSchema),
});

/**
 * Optional sanity checks (recommended):
 * - unique item ids
 * - build relationships refer to existing items
 */
export const ItemsFileSchemaWithRefinements = ItemsFileSchema.superRefine((file, ctx) => {
  const ids = new Set<string>();
  for (const item of file.items) {
    if (ids.has(item.id)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `Duplicate item id: ${item.id}`,
        path: ["items"],
      });
    }
    ids.add(item.id);
  }

  // Validate build relationships reference existing items
  for (let i = 0; i < file.items.length; i++) {
    const item = file.items[i];

    for (const buildFromId of item.relationships.buildsFrom) {
      if (!ids.has(buildFromId)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `Item "${item.id}" references non-existent buildsFrom item: ${buildFromId}`,
          path: ["items", i, "relationships", "buildsFrom"],
        });
      }
    }

    for (const buildIntoId of item.relationships.buildsInto) {
      if (!ids.has(buildIntoId)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `Item "${item.id}" references non-existent buildsInto item: ${buildIntoId}`,
          path: ["items", i, "relationships", "buildsInto"],
        });
      }
    }
  }
});

// Type exports for TypeScript usage
export type ItemCategory = z.infer<typeof ItemCategorySchema>;
export type ItemEffectType = z.infer<typeof ItemEffectTypeSchema>;
export type ItemHistoryEntry = z.infer<typeof ItemHistoryEntrySchema>;
export type ItemIcon = z.infer<typeof ItemIconSchema>;
export type ItemShop = z.infer<typeof ItemShopSchema>;
export type ItemClassification = z.infer<typeof ItemClassificationSchema>;
export type ItemStats = z.infer<typeof ItemStatsSchema>;
export type ItemDetails = z.infer<typeof ItemDetailsSchema>;
export type ItemRelationships = z.infer<typeof ItemRelationshipsSchema>;
export type Item = z.infer<typeof ItemSchema>;
export type ItemsMeta = z.infer<typeof ItemsMetaSchema>;
export type ItemsFile = z.infer<typeof ItemsFileSchema>;

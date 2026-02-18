// src/lib/schemas/gods.ts
import { z } from "zod";

/**
 * Pantheons listed on the Smite 2 wiki page.
 * Keep this tight so you don't silently accept typos.
 * If a new pantheon is added, update here.
 */
export const PantheonSchema = z.enum([
  "Arthurian",
  "Celtic",
  "Chinese",
  "Egyptian",
  "Greek",
  "Hindu",
  "Japanese",
  "Korean",
  "Maya",
  "Norse",
  "Polynesian",
  "Roman",
  "Tales of Arabia",
  "Voodoo",
  "Yoruba",
]);

/**
 * Roles listed on the wiki (Solo/Jungle/Mid/Carry/Support).
 */
export const GodRoleSchema = z.enum(["solo", "jungle", "middle", "carry", "support"]);

/**
 * Damage types as described on the wiki: Physical or Magical.
 */
export const DamageTypeSchema = z.enum(["physical", "magical"]);

/**
 * In Smite 2, gods can scale with Strength, Intelligence, or both ("hybrid").
 * The wiki describes hybrid scaling conceptually, so we model it as an enum.
 */
export const ScalingProfileSchema = z.enum(["strength", "intelligence", "hybrid", "unknown"]);

/**
 * Optional gameplay identity fields. These are not guaranteed from all sources,
 * so keep them nullable and fill in as you gather better data.
 */
export const BasicAttackTypeSchema = z.enum(["melee", "ranged"]);
export const RangeClassSchema = z.enum(["melee", "ranged", "mixed", "unknown"]); // "mixed" for stance swaps, etc.

export const GodIconSchema = z.object({
  // Example: "/images/gods/zeus.webp"
  localPath: z.string().min(1),
  alt: z.string().min(1),
});

export const GodAspectSchema = z.object({
  id: z
    .string()
    .min(1)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "aspect id must be a kebab-case slug"),
  name: z.string().min(1),
  description: z.string().nullable(),
  abilities: z.array(z.lazy(() => GodAbilitySchema)).default([]),
});

export const AbilityTypeSchema = z.enum(["passive", "ability", "ultimate", "basic"]);

export const GodAbilitySchema = z.object({
  // Make key optional in case scraper can't determine it
  key: z.enum(["passive", "1", "2", "3", "4", "basic"]).or(z.string().min(1)).default("unknown"),
  name: z.string().min(1),
  type: AbilityTypeSchema.default("ability"),

  description: z.string().nullable(),

  // Keep these optional for v1. Different sources format these differently.
  cooldownSeconds: z.number().nonnegative().nullable(),
  manaCost: z.number().nonnegative().nullable(),

  // If you later want structured scaling, add it here.
  // v1: allow freeform text while you're still collecting data.
  scalingText: z.string().nullable(),
});

export const GodRelationshipsSchema = z.object({
  // This allows your UI to show: "unique items for this god"
  // by filtering items where restrictedToGodIds includes this god's id.
  // Keep the field anyway in case you later add explicit links.
  uniqueItemIds: z.array(z.string().min(1)).default([]),

  // For future: skins, lore pages, guides, etc.
  relatedGodIds: z.array(z.string().min(1)).default([]),
});

export const GodBaseStatsSchema = z.object({
  // Base stats at level 1
  health: z.number().nonnegative().default(0),
  healthPerLevel: z.number().nonnegative().default(0),
  mana: z.number().nonnegative().default(0),
  manaPerLevel: z.number().nonnegative().default(0),
  healthRegen: z.number().nonnegative().default(0),
  healthRegenPerLevel: z.number().nonnegative().default(0),
  manaRegen: z.number().nonnegative().default(0),
  manaRegenPerLevel: z.number().nonnegative().default(0),

  // Defense
  physicalProtection: z.number().nonnegative().default(0),
  physicalProtectionPerLevel: z.number().nonnegative().default(0),
  magicalProtection: z.number().nonnegative().default(0),
  magicalProtectionPerLevel: z.number().nonnegative().default(0),

  // Offense & Mobility
  attackSpeed: z.number().nonnegative().default(0),
  attackSpeedPerLevel: z.number().nonnegative().default(0),
  movementSpeed: z.number().nonnegative().default(0),
  movementSpeedPerLevel: z.number().nonnegative().default(0),
});

export const GodDetailsSchema = z.object({
  // For your beginner tool, these are gold.
  // Keep as nullable until you write/collect them.
  summary: z.string().nullable(),
  strengths: z.array(z.string().min(1)).default([]),
  weaknesses: z.array(z.string().min(1)).default([]),
  beginnerTips: z.array(z.string().min(1)).default([]),
});

export const GodSchema = z.object({
  id: z
    .string()
    .min(1)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "id must be a kebab-case slug"),
  name: z.string().min(1),

  icon: GodIconSchema,

  identity: z.object({
    pantheon: PantheonSchema.nullable(),
    // Some gods are flex picks; model as an ordered list (primary first).
    // Allow empty array in case scraper can't find roles
    roles: z.array(GodRoleSchema).default([]),

    primaryDamageType: DamageTypeSchema.nullable(),
    scalingProfile: ScalingProfileSchema.default("unknown"),

    // Optional fields, keep nullable in v1.
    basicAttackType: BasicAttackTypeSchema.nullable(),
    rangeClass: RangeClassSchema.default("unknown"),
  }),

  baseStats: GodBaseStatsSchema,

  aspects: z.array(GodAspectSchema).default([]),

  abilities: z.array(GodAbilitySchema).default([]),

  details: GodDetailsSchema.default({
    summary: null,
    strengths: [],
    weaknesses: [],
    beginnerTips: [],
  }),

  relationships: GodRelationshipsSchema.default({
    uniqueItemIds: [],
    relatedGodIds: [],
  }),

  // v1 history: lightweight, same idea as items.
  history: z.array(z.object({ patch: z.string().min(1), notes: z.string().min(1).optional() })).default([]),
});

export const GodsMetaSchema = z.object({
  game: z.literal("smite2"),
  dataVersion: z.number().int().min(1),
  patch: z.string().min(1),
  lastUpdatedUtc: z.string().min(1),
});

export const GodsFileSchema = z.object({
  meta: GodsMetaSchema,
  gods: z.array(GodSchema),
});

/**
 * Recommended refinements:
 * - unique god ids
 */
export const GodsFileSchemaWithRefinements = GodsFileSchema.superRefine((file, ctx) => {
  const ids = new Set<string>();
  for (const god of file.gods) {
    if (ids.has(god.id)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `Duplicate god id: ${god.id}`,
        path: ["gods"],
      });
    }
    ids.add(god.id);
  }
});

/**
 * Types
 */
export type Pantheon = z.infer<typeof PantheonSchema>;
export type GodRole = z.infer<typeof GodRoleSchema>;
export type DamageType = z.infer<typeof DamageTypeSchema>;
export type ScalingProfile = z.infer<typeof ScalingProfileSchema>;
export type GodIcon = z.infer<typeof GodIconSchema>;
export type GodAspect = z.infer<typeof GodAspectSchema>;
export type GodAbility = z.infer<typeof GodAbilitySchema>;
export type GodBaseStats = z.infer<typeof GodBaseStatsSchema>;
export type God = z.infer<typeof GodSchema>;
export type GodsMeta = z.infer<typeof GodsMetaSchema>;
export type GodsFile = z.infer<typeof GodsFileSchema>;

/**
 * Parser helpers
 */
export function parseGodsFile(input: unknown): GodsFile {
  return GodsFileSchemaWithRefinements.parse(input);
}

export function safeParseGodsFile(input: unknown) {
  return GodsFileSchemaWithRefinements.safeParse(input);
}

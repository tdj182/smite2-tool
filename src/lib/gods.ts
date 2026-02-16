// src/lib/gods.ts
import { GodsFileSchemaWithRefinements } from "./schemas/gods";
import type { God, GodsFile, GodRole, Pantheon } from "./schemas/gods";
import godsDataRaw from "@/data/gods.json";

/**
 * Load and validate gods data at module initialization.
 * This ensures that any schema violations are caught early.
 */
function loadGods(): GodsFile {
  try {
    // Validate the gods data with the schema
    const validated = GodsFileSchemaWithRefinements.parse(godsDataRaw);

    console.log(`✓ Loaded ${validated.gods.length} gods from patch ${validated.meta.patch}`);

    return validated;
  } catch (error) {
    console.error("❌ Gods data validation failed!");
    console.error(error);
    throw new Error("Invalid gods data - check console for details");
  }
}

// Validate and export the gods data
export const godsData = loadGods();

/**
 * Helper functions for working with gods
 */

/**
 * Get a god by its ID
 */
export function getGodById(id: string): God | undefined {
  return godsData.gods.find(god => god.id === id);
}

/**
 * Get all gods in a specific role
 */
export function getGodsByRole(role: GodRole): God[] {
  return godsData.gods.filter(god => god.identity.roles.includes(role));
}

/**
 * Get all gods from a specific pantheon
 */
export function getGodsByPantheon(pantheon: Pantheon): God[] {
  return godsData.gods.filter(god => god.identity.pantheon === pantheon);
}

/**
 * Get all gods with a specific damage type
 */
export function getGodsByDamageType(damageType: "physical" | "magical"): God[] {
  return godsData.gods.filter(god => god.identity.primaryDamageType === damageType);
}

/**
 * Get all gods with a specific scaling profile
 */
export function getGodsByScaling(scaling: God["identity"]["scalingProfile"]): God[] {
  return godsData.gods.filter(god => god.identity.scalingProfile === scaling);
}

/**
 * Get all free gods (no unlock cost)
 */
export function getFreeGods(): God[] {
  return godsData.gods.filter(
    god => god.unlock.costDiamonds === 0 || god.unlock.costGodTokens === 0
  );
}

/**
 * Get all gods currently in rotation
 */
export function getRotationGods(): God[] {
  return godsData.gods.filter(god => god.unlock.isInRotation === true);
}

/**
 * Search gods by name (case-insensitive)
 */
export function searchGodsByName(query: string): God[] {
  const lowerQuery = query.toLowerCase();
  return godsData.gods.filter(god =>
    god.name.toLowerCase().includes(lowerQuery)
  );
}

/**
 * Get all gods with beginner tips (good for new players)
 */
export function getBeginnerFriendlyGods(): God[] {
  return godsData.gods.filter(god => god.details.beginnerTips.length > 0);
}

/**
 * Get gods that can flex into multiple roles
 */
export function getFlexPickGods(): God[] {
  return godsData.gods.filter(god => god.identity.roles.length > 1);
}

/**
 * Get all gods that have aspects
 */
export function getGodsWithAspects(): God[] {
  return godsData.gods.filter(god => god.aspects.length > 0);
}

/**
 * Get a specific aspect for a god
 */
export function getGodAspect(godId: string, aspectId: string) {
  const god = getGodById(godId);
  if (!god) return undefined;

  return god.aspects.find(aspect => aspect.id === aspectId);
}

/**
 * Get gods by their unlock cost range
 */
export function getGodsByPriceRange(
  minDiamonds?: number,
  maxDiamonds?: number
): God[] {
  return godsData.gods.filter(god => {
    const cost = god.unlock.costDiamonds;
    if (cost === null) return false;

    if (minDiamonds !== undefined && cost < minDiamonds) return false;
    if (maxDiamonds !== undefined && cost > maxDiamonds) return false;

    return true;
  });
}

/**
 * Get recommended gods for a specific role (based on primary role)
 */
export function getRecommendedGodsForRole(role: GodRole): God[] {
  return godsData.gods.filter(god => god.identity.roles[0] === role);
}

/**
 * Get gods by range class (melee/ranged)
 */
export function getGodsByRange(rangeClass: God["identity"]["rangeClass"]): God[] {
  return godsData.gods.filter(god => god.identity.rangeClass === rangeClass);
}

/**
 * Get all unique pantheons in the data
 */
export function getAllPantheons(): Pantheon[] {
  const pantheons = new Set<Pantheon>();
  godsData.gods.forEach(god => {
    if (god.identity.pantheon) {
      pantheons.add(god.identity.pantheon);
    }
  });
  return Array.from(pantheons).sort();
}

/**
 * Get statistics about the god pool
 */
export function getGodPoolStats() {
  const total = godsData.gods.length;
  const physical = getGodsByDamageType("physical").length;
  const magical = getGodsByDamageType("magical").length;
  const free = getFreeGods().length;
  const withAspects = getGodsWithAspects().length;

  return {
    total,
    physical,
    magical,
    free,
    withAspects,
    pantheons: getAllPantheons().length,
  };
}

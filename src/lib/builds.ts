import buildsDataRaw from '@/data/builds.json';
import { BuildsDataSchema, type Build, type BuildRole } from './schemas/builds';

// Validate and export the builds data
export const buildsData = BuildsDataSchema.parse(buildsDataRaw);

/**
 * Get a build by its ID
 */
export function getBuildById(id: string): Build | undefined {
  return buildsData.builds.find(build => build.id === id);
}

/**
 * Get all builds for a specific role
 */
export function getBuildsByRole(role: BuildRole): Build[] {
  return buildsData.builds.filter(build => build.role === role);
}

/**
 * Get all builds that include a specific item
 */
export function getBuildsByItemId(itemId: string): Build[] {
  return buildsData.builds.filter(build => build.itemIds.includes(itemId));
}

/**
 * Search builds by name or description
 */
export function searchBuilds(query: string): Build[] {
  const lowerQuery = query.toLowerCase();
  return buildsData.builds.filter(
    build =>
      build.name.toLowerCase().includes(lowerQuery) ||
      build.description.toLowerCase().includes(lowerQuery) ||
      build.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
  );
}

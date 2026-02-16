// src/lib/items.ts
import { ItemsFileSchemaWithRefinements } from "./schemas/items";
import type { Item, ItemsFile } from "./schemas/items";
import itemsDataRaw from "@/data/items.json";

/**
 * Load and validate items data at module initialization.
 * This ensures that any schema violations are caught early.
 */
function loadItems(): ItemsFile {
  try {
    // This is where the magic happens! The schema validates your JSON.
    const validated = ItemsFileSchemaWithRefinements.parse(itemsDataRaw);

    console.log(`✓ Loaded ${validated.items.length} items from patch ${validated.meta.patch}`);

    return validated;
  } catch (error) {
    console.error("❌ Items data validation failed!");
    console.error(error);
    throw new Error("Invalid items data - check console for details");
  }
}

// Validate and export the items data
export const itemsData = loadItems();

/**
 * Helper functions for working with items
 */

/**
 * Get an item by its ID
 */
export function getItemById(id: string): Item | undefined {
  return itemsData.items.find(item => item.id === id);
}

/**
 * Get all items in a specific category
 */
export function getItemsByCategory(category: Item["classification"]["category"]): Item[] {
  return itemsData.items.filter(item => item.classification.category === category);
}

/**
 * Get all items of a specific tier
 */
export function getItemsByTier(tier: number): Item[] {
  return itemsData.items.filter(item => item.classification.tier === tier);
}

/**
 * Get all items that match a tag
 */
export function getItemsByTag(tag: string): Item[] {
  return itemsData.items.filter(item => item.tags.includes(tag));
}

/**
 * Search items by name (case-insensitive)
 */
export function searchItemsByName(query: string): Item[] {
  const lowerQuery = query.toLowerCase();
  return itemsData.items.filter(item =>
    item.name.toLowerCase().includes(lowerQuery)
  );
}

/**
 * Get the build path for an item (what it builds from recursively)
 */
export function getBuildPath(itemId: string): Item[] {
  const item = getItemById(itemId);
  if (!item || item.relationships.buildsFrom.length === 0) {
    return [];
  }

  const path: Item[] = [];
  for (const parentId of item.relationships.buildsFrom) {
    const parent = getItemById(parentId);
    if (parent) {
      path.push(parent);
      // Recursively get the parent's build path
      path.push(...getBuildPath(parentId));
    }
  }

  return path;
}

/**
 * Get items that build into this item
 */
export function getItemsThatBuildInto(itemId: string): Item[] {
  return itemsData.items.filter(item =>
    item.relationships.buildsInto.includes(itemId)
  );
}

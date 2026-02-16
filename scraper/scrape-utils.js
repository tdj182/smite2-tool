// ============================================
// SCRAPER UTILITIES
// Shared utilities for web scraping
// ============================================

/**
 * Fetches data with retry logic and exponential backoff
 * Handles connection errors like ECONNRESET, ETIMEDOUT, etc.
 *
 * @param {Function} fetchFn - Async function to execute
 * @param {string} itemName - Name of item being fetched (for logging)
 * @param {number} maxRetries - Maximum retry attempts (default: 3)
 * @returns {Promise<any>} Result from fetchFn
 */
export async function fetchWithRetry(fetchFn, itemName = 'item', maxRetries = 3) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await fetchFn();
    } catch (error) {
      if (attempt === maxRetries) {
        throw error; // Give up after max retries
      }

      // Check if it's a connection error that we should retry
      const isRetryable = error.code === 'ECONNRESET' ||
                          error.code === 'ETIMEDOUT' ||
                          error.code === 'ENOTFOUND' ||
                          error.code === 'ECONNREFUSED' ||
                          error.message?.includes('timeout') ||
                          error.message?.includes('socket hang up');

      if (!isRetryable) {
        throw error; // Don't retry non-connection errors
      }

      // Exponential backoff: 2s, 4s, 8s
      const waitTime = Math.pow(2, attempt) * 1000;
      console.log(`⚠️  Connection error for "${itemName}", retrying in ${waitTime/1000}s (attempt ${attempt}/${maxRetries})...`);
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
  }
}

/**
 * Sleep helper for adding delays between requests
 *
 * @param {number} ms - Milliseconds to sleep
 * @returns {Promise<void>}
 */
export function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Sanitize a name to create a valid ID (kebab-case)
 * Removes special characters and converts to lowercase
 *
 * @param {string} name - Name to sanitize
 * @returns {string} Kebab-case ID
 */
export function sanitizeId(name) {
  return name
    .toLowerCase()
    .replace(/'/g, '')           // Remove apostrophes
    .replace(/\s+/g, '-')        // Replace spaces with hyphens
    .replace(/[^a-z0-9-]/g, '')  // Remove non-alphanumeric chars (except hyphens)
    .replace(/-+/g, '-')         // Replace multiple hyphens with single
    .replace(/^-|-$/g, '');      // Remove leading/trailing hyphens
}

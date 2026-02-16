// ============================================
// IMAGE DOWNLOADER FOR GODS AND ITEMS
// Downloads and converts images to WebP
// ============================================

import axios from 'axios';
import * as cheerio from 'cheerio';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { fetchWithRetry, sleep, sanitizeId } from './scrape-utils.js';

// Get __dirname equivalent for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Downloads an image from a URL and saves it
 * @param {string} imageUrl - URL of the image to download
 * @param {string} outputPath - Where to save the image
 */
async function downloadImage(imageUrl, outputPath) {
  const response = await axios.get(imageUrl, {
    responseType: 'arraybuffer',
    timeout: 30000,
  });

  // Create directory if it doesn't exist
  const dir = path.dirname(outputPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  // Save the image
  fs.writeFileSync(outputPath, response.data);
}

/**
 * Extracts the main image URL from a wiki page
 * @param {string} pageName - Name of the wiki page
 * @returns {string|null} - URL of the main image
 */
async function getImageUrlFromWiki(pageName) {
  const url = `https://wiki.smite2.com/${pageName.replace(/ /g, '_')}`;
  const response = await axios.get(url);
  const $ = cheerio.load(response.data);

  // Try to find the main image in the infobox
  let imageUrl = $('.infobox img').first().attr('src');

  // If not in infobox, try the first image in the article
  if (!imageUrl) {
    imageUrl = $('#mw-content-text img').first().attr('src');
  }

  // Make sure it's a full URL
  if (imageUrl && !imageUrl.startsWith('http')) {
    imageUrl = `https://wiki.smite2.com${imageUrl}`;
  }

  return imageUrl || null;
}

/**
 * Downloads images for gods
 */
async function downloadGodImages() {
  console.log('🖼️  DOWNLOADING GOD IMAGES');
  console.log('='.repeat(60));

  // Read the gods data
  const godsDataPath = path.join(__dirname, 'gods-output.json');
  if (!fs.existsSync(godsDataPath)) {
    console.error('❌ Error: gods-output.json not found. Run scrape-all-gods.js first.');
    return;
  }

  const godsData = JSON.parse(fs.readFileSync(godsDataPath, 'utf-8'));
  const gods = godsData.gods || [];

  console.log(`\n📥 Found ${gods.length} gods to download images for\n`);

  const outputDir = path.join(__dirname, '..', 'public', 'images', 'gods');
  const errors = [];
  let successCount = 0;

  for (let i = 0; i < gods.length; i++) {
    const god = gods[i];
    const progress = `[${i + 1}/${gods.length}]`;

    console.log(`${progress} 📥 Downloading image for ${god.name}...`);

    try {
      // Get image URL from wiki page
      const imageUrl = await fetchWithRetry(
        () => getImageUrlFromWiki(god.name),
        god.name
      );

      if (!imageUrl) {
        console.warn(`⚠️  ${progress} No image found for ${god.name}`);
        errors.push({ god: god.name, error: 'No image found' });
        continue;
      }

      // Determine file extension from URL
      const urlExt = path.extname(new URL(imageUrl).pathname);
      const tempPath = path.join(outputDir, `${god.id}${urlExt}`);
      const finalPath = path.join(outputDir, `${god.id}.webp`);

      // Download the image
      await fetchWithRetry(
        () => downloadImage(imageUrl, tempPath),
        `${god.name} image`
      );

      // For now, just rename to .webp (we'll add conversion later if needed)
      // If you have sharp installed, you can convert here
      if (urlExt !== '.webp') {
        // Try to use sharp if available, otherwise just rename
        try {
          const sharp = await import('sharp');
          await sharp.default(tempPath)
            .webp({ quality: 90 })
            .toFile(finalPath);
          fs.unlinkSync(tempPath); // Delete temp file
        } catch (err) {
          // Sharp not installed, just rename
          fs.renameSync(tempPath, finalPath);
        }
      } else {
        fs.renameSync(tempPath, finalPath);
      }

      successCount++;
      console.log(`✅ ${progress} Downloaded ${god.name}`);

      // Be respectful - wait between requests
      await sleep(1000);

    } catch (error) {
      console.error(`❌ ${progress} Error downloading ${god.name}:`, error.message);
      errors.push({ god: god.name, error: error.message });
    }
  }

  // Print summary
  console.log(`\n${'='.repeat(60)}`);
  console.log('📊 DOWNLOAD SUMMARY (GODS)');
  console.log('='.repeat(60));
  console.log(`✅ Successfully downloaded: ${successCount} images`);
  console.log(`❌ Failed: ${errors.length} images`);

  if (errors.length > 0) {
    console.log('\n⚠️  Failed images:');
    errors.forEach(({ god, error }) => {
      console.log(`  • ${god}: ${error}`);
    });
  }
}

/**
 * Downloads images for items
 */
async function downloadItemImages() {
  console.log('\n\n🖼️  DOWNLOADING ITEM IMAGES');
  console.log('='.repeat(60));

  // Read the items data
  const itemsDataPath = path.join(__dirname, 'items-output.json');
  if (!fs.existsSync(itemsDataPath)) {
    console.error('❌ Error: items-output.json not found. Run scrape-all-items.js first.');
    return;
  }

  const itemsData = JSON.parse(fs.readFileSync(itemsDataPath, 'utf-8'));
  const items = itemsData.items || [];

  console.log(`\n📥 Found ${items.length} items to download images for\n`);

  const outputDir = path.join(__dirname, '..', 'public', 'images', 'items');
  const errors = [];
  let successCount = 0;

  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    const progress = `[${i + 1}/${items.length}]`;

    console.log(`${progress} 📥 Downloading image for ${item.name}...`);

    try {
      // Get image URL from wiki page
      const imageUrl = await fetchWithRetry(
        () => getImageUrlFromWiki(item.name),
        item.name
      );

      if (!imageUrl) {
        console.warn(`⚠️  ${progress} No image found for ${item.name}`);
        errors.push({ item: item.name, error: 'No image found' });
        continue;
      }

      // Determine file extension from URL
      const urlExt = path.extname(new URL(imageUrl).pathname);
      const tempPath = path.join(outputDir, `${item.id}${urlExt}`);
      const finalPath = path.join(outputDir, `${item.id}.webp`);

      // Download the image
      await fetchWithRetry(
        () => downloadImage(imageUrl, tempPath),
        `${item.name} image`
      );

      // Convert to WebP if sharp is available
      if (urlExt !== '.webp') {
        try {
          const sharp = await import('sharp');
          await sharp.default(tempPath)
            .webp({ quality: 90 })
            .toFile(finalPath);
          fs.unlinkSync(tempPath); // Delete temp file
        } catch (err) {
          // Sharp not installed, just rename
          fs.renameSync(tempPath, finalPath);
        }
      } else {
        fs.renameSync(tempPath, finalPath);
      }

      successCount++;
      console.log(`✅ ${progress} Downloaded ${item.name}`);

      // Be respectful - wait between requests
      await sleep(1000);

    } catch (error) {
      console.error(`❌ ${progress} Error downloading ${item.name}:`, error.message);
      errors.push({ item: item.name, error: error.message });
    }
  }

  // Print summary
  console.log(`\n${'='.repeat(60)}`);
  console.log('📊 DOWNLOAD SUMMARY (ITEMS)');
  console.log('='.repeat(60));
  console.log(`✅ Successfully downloaded: ${successCount} images`);
  console.log(`❌ Failed: ${errors.length} images`);

  if (errors.length > 0) {
    console.log('\n⚠️  Failed images:');
    errors.forEach(({ item, error }) => {
      console.log(`  • ${item}: ${error}`);
    });
  }
}

/**
 * Main function
 */
async function main() {
  console.log('🚀 IMAGE DOWNLOADER');
  console.log('='.repeat(60));
  console.log('This will download all god and item images from the wiki');
  console.log('Images will be saved to public/images/gods and public/images/items\n');

  try {
    // Check if sharp is available for WebP conversion
    try {
      await import('sharp');
      console.log('✅ Sharp is installed - images will be converted to WebP');
    } catch {
      console.log('⚠️  Sharp is not installed - images will be saved in original format');
      console.log('💡 To convert to WebP, install sharp: npm install sharp\n');
    }

    // Download god images
    await downloadGodImages();

    // Download item images
    await downloadItemImages();

    console.log('\n\n🎉 ALL DOWNLOADS COMPLETE!');

  } catch (error) {
    console.error('❌ Fatal error:', error.message);
  }
}

// Run it!
main();

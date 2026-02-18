// ============================================
// SCRAPE ALL ITEMS FROM WIKI
// Gets item list, then scrapes each one
// ============================================

import axios from "axios";
import * as cheerio from "cheerio";
import fs from "fs";
import { scrapeItem } from "./scrape-item-enhanced.js";
import { fetchWithRetry, sleep } from "./scrape-utils.js";

// Get list of god names to exclude from items
async function getGodNames() {
  try {
    const response = await axios.get("https://wiki.smite2.com/");
    const $ = cheerio.load(response.data);
    const godNames = new Set();

    $("#mw-content-text a").each((_i, link) => {
      const href = $(link).attr("href");
      if (href && href.match(/^\/w?\/[A-Z]/) && !href.includes(":")) {
        const godName = href.replace(/^\/w?\//, "").replace(/_/g, " ");
        // Only add if it looks like a god name (starts with capital, only letters and spaces)
        if (godName.match(/^[A-Z][A-Za-z\s'-]+$/) && godName.length >= 3) {
          godNames.add(godName);
        }
      }
    });

    console.log(`  📋 Found ${godNames.size} gods to exclude from items\n`);
    return godNames;
  } catch (error) {
    console.warn("  ⚠️  Could not fetch god list, continuing without god exclusions");
    return new Set();
  }
}

// Get list of all items from the main page
async function getAllItemNames() {
  console.log("📋 Fetching item list from wiki...\n");

  // First, get the god names to exclude
  const godNames = await getGodNames();

  const response = await axios.get("https://wiki.smite2.com/w/Items");
  const $ = cheerio.load(response.data);

  const itemLinks = [];
  const seenItems = new Set();

  // Find all item links in the main content
  // Items are organized in sections with links to individual pages
  // We specifically look for links that have images (item icons)
  $("#mw-content-text a").each((_i, link) => {
    const $link = $(link);
    const href = $link.attr("href");
    const title = $link.attr("title") || $link.text().trim();

    // Only consider links that have an image (item icon) or are in item tables
    const hasImage = $link.find("img").length > 0;
    const inTable = $link.closest("table").length > 0;

    // Filter for item pages (exclude special pages, categories, etc.)
    if (href && href.startsWith("/w/") && title && !href.includes(":") && (hasImage || inTable)) {
      // Extract item name from URL or title
      const itemName = title;

      // Skip if too short or contains problematic patterns
      if (itemName.length < 3) return;

      // Exclude pages that are clearly not items
      if (
        itemName.includes("(page does not exist)") ||
        itemName.includes("Edit section") ||
        itemName.startsWith("Edit ") ||
        itemName === "SMITE 2" ||
        itemName === "Smite Wiki" ||
        itemName === "Statistics" ||
        itemName === "Attack and Defense" ||
        itemName === "Gold"
      ) {
        return;
      }

      // Exclude non-item page categories
      const excludePages = [
        "Main_Page",
        "Main Page",
        "Items",
        "Gods",
        "Abilities",
        "Game_Mode",
        "Game Modes",
        "Patch",
        "Category",
        "Template",
        "File",
        "Special",
        "Help",
        "User",
        "Community",
        "Forum",
        "Blog",
        "MediaWiki",
        "Talk",
        "Map",
        "Maps",
        "Mode",
        "Modes",
        "Meta",
        "Guide",
        "Tier List",
        "Conquest",
        "Arena",
        "Joust",
        "Assault",
        "Siege",
        "Slash",
        "Alpha",
        "Beta",
        "Closed",
        "Open",
        "Version",
        "Update",
        "Changelog",
        "Pantheon",
      ];

      const shouldExclude = excludePages.some((page) =>
        itemName.toLowerCase().includes(page.toLowerCase()),
      );

      if (shouldExclude) return;

      // Exclude if it's a god name
      if (godNames.has(itemName)) {
        return;
      }

      // Only add items we find in specific item-related sections
      // Look for the link's parent section heading
      const parentSection = $(link)
        .parents()
        .prevAll("h2, h3")
        .first()
        .text()
        .toLowerCase();

      // Skip if the link is in a "gods" or "pantheon" section
      if (
        parentSection.includes("god") ||
        parentSection.includes("pantheon") ||
        parentSection.includes("playable")
      ) {
        return;
      }

      if (!seenItems.has(itemName)) {
        seenItems.add(itemName);
        itemLinks.push(itemName);
      }
    }
  });

  console.log(`✅ Found ${itemLinks.length} potential item pages`);
  console.log(`📝 First 10: ${itemLinks.slice(0, 10).join(", ")}\n`);
  return itemLinks;
}

// Main scraping function
async function scrapeAllItems() {
  try {
    // Get item list
    const itemNames = await getAllItemNames();

    console.log(`\n🚀 Starting scrape of ${itemNames.length} items...`);
    console.log(
      "⏱️  This will take a while (2 second delay between each item)\n",
    );

    const allItemsData = {
      meta: {
        game: "smite2",
        dataVersion: 1,
        patch: "Open Beta",
        lastUpdatedUtc: new Date().toISOString(),
      },
      items: [],
    };

    // Scrape all items
    const itemsToScrape = itemNames;
    const errors = [];
    let successCount = 0;

    for (let i = 0; i < itemsToScrape.length; i++) {
      const itemName = itemsToScrape[i];
      const progress = `[${i + 1}/${itemsToScrape.length}]`;

      console.log(`\n${"=".repeat(60)}`);
      console.log(`${progress} 📥 Scraping ${itemName}...`);
      console.log("=".repeat(60));

      try {
        const itemData = await fetchWithRetry(
          () => scrapeItem(itemName),
          itemName,
        );
        allItemsData.items.push(itemData);
        successCount++;
        console.log(`✅ ${progress} Successfully scraped ${itemName}`);

        // Be respectful - wait between requests
        await sleep(2000);
      } catch (error) {
        console.error(
          `❌ ${progress} Error scraping ${itemName}:`,
          error.message,
        );
        errors.push({ item: itemName, error: error.message });
      }
    }

    // Print summary
    console.log(`\n\n${"=".repeat(60)}`);
    console.log("📊 SCRAPING SUMMARY");
    console.log("=".repeat(60));
    console.log(`✅ Successfully scraped: ${successCount} items`);
    console.log(`❌ Failed: ${errors.length} items`);

    if (errors.length > 0) {
      console.log("\n⚠️  Failed items:");
      errors.forEach(({ item, error }) => {
        console.log(`  • ${item}: ${error}`);
      });
    }

    // Save to file
    const outputPath = "scraper/items-output.json";
    fs.writeFileSync(outputPath, JSON.stringify(allItemsData, null, 2));

    console.log(`\n\n🎉 SCRAPING COMPLETE!`);
    console.log(
      `📁 Successfully saved ${allItemsData.items.length} items to: ${outputPath}`,
    );
    console.log(
      `\n💡 Next step: Review the data and copy to src/data/items.json`,
    );
  } catch (error) {
    console.error("❌ Fatal error:", error.message);
  }
}

// Run it!
scrapeAllItems();

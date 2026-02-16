// ============================================
// SCRAPE ALL GODS FROM WIKI
// Gets god list, then scrapes each one
// ============================================

import axios from "axios";
import * as cheerio from "cheerio";
import fs from "fs";
import { scrapeGod } from "./scrape-god-enhanced.js";
import { fetchWithRetry, sleep } from "./scrape-utils.js";

// Get list of all gods from the main page
async function getAllGodNames() {
  console.log("📋 Fetching god list from wiki...\n");

  const response = await axios.get("https://wiki.smite2.com/");
  const $ = cheerio.load(response.data);

  const godLinks = [];
  const seenGods = new Set();

  // Expanded exclusion list for non-god pages
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
    "Relic",
    "Relics",
    "Consumable",
    "Consumables",
    "Starter",
    "Starters",
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
  ];

  // Helper function to check if a name should be excluded
  const shouldExclude = (name) => {
    const lowerName = name.toLowerCase();

    // Check against exclusion list
    if (excludePages.some((page) => lowerName.includes(page.toLowerCase()))) {
      return true;
    }

    // Exclude pages with special characters or numbers
    if (name.match(/[0-9]/) || name.match(/[_:]/)) {
      return true;
    }

    // Exclude very short names (likely not gods)
    if (name.length < 3) {
      return true;
    }

    return false;
  };

  // Find all links in the main content
  $("#mw-content-text a").each((_i, link) => {
    const href = $(link).attr("href");
    const title = $(link).attr("title") || $(link).text().trim();

    // Filter for god pages (they're usually /w/GodName or /GodName)
    // Must start with capital letter and not contain special characters
    if (href && href.match(/^\/w?\/[A-Z]/) && !href.includes(":") && title) {
      // Extract god name from URL
      const godName = href.replace(/^\/w?\//, "").replace(/_/g, " ");

      if (!shouldExclude(godName) && !seenGods.has(godName)) {
        seenGods.add(godName);
        godLinks.push(godName);
      }
    }
  });

  console.log(`✅ Found ${godLinks.length} potential god pages`);
  console.log(`📝 First 10: ${godLinks.slice(0, 10).join(", ")}\n`);
  return godLinks;
}

// Main scraping function
async function scrapeAllGods() {
  try {
    // Get god list
    const godNames = await getAllGodNames();

    console.log(`\n🚀 Starting scrape of ${godNames.length} gods...`);
    console.log(
      "⏱️  This will take a while (2 second delay between each god)\n",
    );

    const allGodsData = {
      meta: {
        game: "smite2",
        dataVersion: 1,
        patch: "Open Beta",
        lastUpdatedUtc: new Date().toISOString(),
      },
      gods: [],
    };

    // Scrape all gods
    const godsToScrape = godNames;
    const errors = [];
    let successCount = 0;

    for (let i = 0; i < godsToScrape.length; i++) {
      const godName = godsToScrape[i];
      const progress = `[${i + 1}/${godsToScrape.length}]`;

      console.log(`\n${"=".repeat(60)}`);
      console.log(`${progress} 📥 Scraping ${godName}...`);
      console.log("=".repeat(60));

      try {
        const godData = await fetchWithRetry(() => scrapeGod(godName), godName);
        allGodsData.gods.push(godData);
        successCount++;
        console.log(`✅ ${progress} Successfully scraped ${godName}`);

        // Be respectful - wait between requests
        await sleep(2000);
      } catch (error) {
        console.error(
          `❌ ${progress} Error scraping ${godName}:`,
          error.message,
        );
        errors.push({ god: godName, error: error.message });
      }
    }

    // Print summary
    console.log(`\n\n${"=".repeat(60)}`);
    console.log("📊 SCRAPING SUMMARY");
    console.log("=".repeat(60));
    console.log(`✅ Successfully scraped: ${successCount} gods`);
    console.log(`❌ Failed: ${errors.length} gods`);

    if (errors.length > 0) {
      console.log("\n⚠️  Failed gods:");
      errors.forEach(({ god, error }) => {
        console.log(`  • ${god}: ${error}`);
      });
    }

    // Save to file
    const outputPath = "scraper/gods-output.json";
    fs.writeFileSync(outputPath, JSON.stringify(allGodsData, null, 2));

    console.log(`\n\n🎉 SCRAPING COMPLETE!`);
    console.log(
      `📁 Successfully saved ${allGodsData.gods.length} gods to: ${outputPath}`,
    );
    console.log(`\n💡 Next step: Copy this file to src/data/gods.json`);
  } catch (error) {
    console.error("❌ Fatal error:", error.message);
  }
}

// Run it!
scrapeAllGods();

// ============================================
// ENHANCED ITEM DATA SCRAPER
// Extracts complete item data from wiki
// ============================================

import axios from 'axios';
import * as cheerio from 'cheerio';
import { sanitizeId } from './scrape-utils.js';

export async function scrapeItem(itemName) {
  console.log(`\n📥 Scraping ${itemName}...`);
  console.log('='.repeat(60));

  const url = `https://wiki.smite2.com/${itemName.replace(/ /g, '_')}`;
  const response = await axios.get(url);
  const $ = cheerio.load(response.data);

  // Initialize item data
  const itemId = sanitizeId(itemName);
  const itemData = {
    id: itemId,
    name: itemName,
    icon: {
      localPath: `/images/items/${itemId}.webp`,
      alt: `${itemName} icon`
    },
    shop: {
      cost: 0
    },
    classification: {
      tier: null,
      category: 'item',
      effectType: 'passive'
    },
    stats: {},
    tags: [],
    details: {
      summary: null,
      passive: null,
      active: null,
      cooldownSeconds: null
    },
    relationships: {
      buildsFrom: [],
      buildsInto: [],
      restrictedToGodIds: []
    },
    history: []
  };

  // ============================================
  // PARSE INFOBOX
  // ============================================
  console.log('\n📦 Parsing infobox...');

  const infobox = $('.infobox').first();
  const rows = infobox.find('tr');

  rows.each((_i, row) => {
    const $row = $(row);
    const header = $row.find('th').text().trim().toLowerCase();
    const data = $row.find('td').text().trim();

    // Extract cost
    if (header.includes('cost') && !header.includes('total')) {
      const costMatch = data.match(/(\d+)/);
      if (costMatch) {
        itemData.shop.cost = parseInt(costMatch[1]);
        console.log(`  ✓ Cost: ${itemData.shop.cost}`);
      }
    }

    // Extract item type (relic, starter, consumable, curio, item)
    if (header.includes('type')) {
      const typeLower = data.toLowerCase();
      if (typeLower.includes('relic')) {
        itemData.classification.category = 'relic';
      } else if (typeLower.includes('starter')) {
        itemData.classification.category = 'starter';
      } else if (typeLower.includes('consumable')) {
        itemData.classification.category = 'consumable';
      } else if (typeLower.includes('curio')) {
        itemData.classification.category = 'curio';
      }
      console.log(`  ✓ Category: ${itemData.classification.category}`);
    }
  });

  // ============================================
  // DETECT TIER FROM HEADINGS OR CATEGORIES
  // ============================================
  console.log('\n🎯 Detecting tier...');

  const pageText = $('#mw-content-text').text();

  // Try to find tier in category links
  $('.catlinks a').each((_i, link) => {
    const categoryText = $(link).text().toLowerCase();
    if (categoryText.includes('tier i items') && !categoryText.includes('tier ii') && !categoryText.includes('tier iii')) {
      itemData.classification.tier = 1;
    } else if (categoryText.includes('tier ii items')) {
      itemData.classification.tier = 2;
    } else if (categoryText.includes('tier iii items')) {
      itemData.classification.tier = 3;
    }
  });

  // Starters are tier 1, upgraded starters are tier 2-3
  if (itemData.classification.category === 'starter') {
    if (!itemData.classification.tier) {
      itemData.classification.tier = 1;
    }
  }

  console.log(`  ✓ Tier: ${itemData.classification.tier || 'N/A'}`);

  // ============================================
  // PARSE STATS FROM INFOBOX
  // ============================================
  console.log('\n📊 Parsing stats...');

  const statMappings = {
    'strength': 'strength',
    'intelligence': 'intelligence',
    'health': 'health',
    'max health': 'health',
    'mana': 'mana',
    'max mana': 'maxMana',
    'health regen': 'healthRegen',
    'mana regen': 'manaRegen',
    'physical protection': 'physicalProtection',
    'magical protection': 'magicalProtection',
    'attack speed': 'attackSpeed',
    'movement speed': 'movementSpeed',
    'critical strike chance': 'criticalStrikeChance',
    'cooldown reduction': 'cooldownReduction',
    'in-hand power': 'inhandPower',
    'inhand power': 'inhandPower',
    'lifesteal': 'lifesteal',
    'penetration': 'penetration'
  };

  rows.each((_i, row) => {
    const $row = $(row);
    const header = $row.find('th').text().trim().toLowerCase().replace(/[:.]/g, '').trim();
    const data = $row.find('td').text().trim();

    for (const [searchTerm, jsonKey] of Object.entries(statMappings)) {
      if (header === searchTerm) {
        // Extract numeric value (handle formats like "20", "+20", "20%")
        const match = data.match(/([\d.]+)/);
        if (match) {
          const value = parseFloat(match[1]);
          itemData.stats[jsonKey] = value;
          console.log(`  ✓ ${searchTerm}: ${value}`);
        }
      }
    }
  });

  // ============================================
  // PARSE PASSIVE/ACTIVE EFFECTS
  // ============================================
  console.log('\n⚡ Parsing effects...');

  // Look for passive effect
  $('h2, h3').each((_i, heading) => {
    const $heading = $(heading);
    const headingText = $heading.text().toLowerCase();

    if (headingText.includes('passive')) {
      itemData.classification.effectType = 'passive';
      const nextP = $heading.next('p');
      if (nextP.length) {
        itemData.details.passive = nextP.text().trim();
        console.log(`  ✓ Passive: ${itemData.details.passive.substring(0, 50)}...`);
      }
    }

    if (headingText.includes('active')) {
      itemData.classification.effectType = 'active';
      const nextP = $heading.next('p');
      if (nextP.length) {
        const activeText = nextP.text().trim();
        itemData.details.active = activeText;

        // Extract cooldown from active text
        const cooldownMatch = activeText.match(/cooldown:?\s*(\d+)s?/i);
        if (cooldownMatch) {
          itemData.details.cooldownSeconds = parseInt(cooldownMatch[1]);
        }

        console.log(`  ✓ Active: ${activeText.substring(0, 50)}...`);
        if (itemData.details.cooldownSeconds) {
          console.log(`  ✓ Cooldown: ${itemData.details.cooldownSeconds}s`);
        }
      }
    }
  });

  // Also check infobox for effects
  rows.each((_i, row) => {
    const $row = $(row);
    const header = $row.find('th').text().trim().toLowerCase();
    const data = $row.find('td').text().trim();

    if (header.includes('passive effect') || header === 'passive') {
      itemData.details.passive = data;
      itemData.classification.effectType = 'passive';
      console.log(`  ✓ Passive: ${data.substring(0, 50)}...`);
    }

    if (header.includes('active effect') || header === 'active') {
      itemData.details.active = data;
      itemData.classification.effectType = 'active';

      // Extract cooldown
      const cooldownMatch = data.match(/cooldown:?\s*(\d+)s?/i);
      if (cooldownMatch) {
        itemData.details.cooldownSeconds = parseInt(cooldownMatch[1]);
        console.log(`  ✓ Cooldown: ${itemData.details.cooldownSeconds}s`);
      }

      console.log(`  ✓ Active: ${data.substring(0, 50)}...`);
    }
  });

  // ============================================
  // PARSE BUILD PATHS
  // ============================================
  console.log('\n🔨 Parsing build paths...');

  // Find "Builds from" section
  $('h2, h3').each((_i, heading) => {
    const $heading = $(heading);
    const headingText = $heading.text().toLowerCase();

    if (headingText.includes('builds from')) {
      const nextElement = $heading.next();
      nextElement.find('a').each((_j, link) => {
        const itemName = $(link).attr('title') || $(link).text().trim();
        if (itemName && !itemName.includes(':')) {
          const buildItemId = sanitizeId(itemName);
          if (!itemData.relationships.buildsFrom.includes(buildItemId)) {
            itemData.relationships.buildsFrom.push(buildItemId);
            console.log(`  ✓ Builds from: ${itemName}`);
          }
        }
      });
    }

    if (headingText.includes('builds into')) {
      const nextElement = $heading.next();
      nextElement.find('a').each((_j, link) => {
        const itemName = $(link).attr('title') || $(link).text().trim();
        if (itemName && !itemName.includes(':')) {
          const buildItemId = sanitizeId(itemName);
          if (!itemData.relationships.buildsInto.includes(buildItemId)) {
            itemData.relationships.buildsInto.push(buildItemId);
            console.log(`  ✓ Builds into: ${itemName}`);
          }
        }
      });
    }
  });

  // ============================================
  // GENERATE TAGS
  // ============================================
  console.log('\n🏷️ Generating tags...');

  const tags = new Set();

  // Add category tag
  tags.add(itemData.classification.category);

  // Add tags based on stats
  if (itemData.stats.strength) tags.add('physical');
  if (itemData.stats.intelligence) tags.add('magical');
  if (itemData.stats.health) tags.add('health');
  if (itemData.stats.maxMana || itemData.stats.manaRegen) tags.add('mana');
  if (itemData.stats.physicalProtection || itemData.stats.magicalProtection) tags.add('defense');
  if (itemData.stats.attackSpeed) tags.add('attack-speed');
  if (itemData.stats.criticalStrikeChance) tags.add('crit');
  if (itemData.stats.cooldownReduction) tags.add('cooldown');
  if (itemData.stats.lifesteal) tags.add('lifesteal');
  if (itemData.stats.penetration) tags.add('penetration');

  itemData.tags = Array.from(tags);
  console.log(`  ✓ Tags: ${itemData.tags.join(', ')}`);

  console.log('\n✅ Scraping complete!\n');

  return itemData;
}

// Test with Purification Beads (only runs when executed directly, not when imported)
async function main() {
  try {
    const itemData = await scrapeItem('Purification Beads');

    // Pretty print the result
    console.log('\n📄 EXTRACTED DATA:');
    console.log('='.repeat(60));
    console.log(JSON.stringify(itemData, null, 2));

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

// Only run main() if this file is executed directly (not imported)
if (import.meta.url === `file:///${process.argv[1].replace(/\\/g, '/')}`) {
  main();
}

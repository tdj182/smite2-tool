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
      cost: 0,
      totalCost: null
    },
    classification: {
      tier: null,
      category: 'item',
      effectType: 'none'
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

    // Extract total cost
    if (header.includes('total cost')) {
      const totalCostMatch = data.match(/(\d+)/);
      if (totalCostMatch) {
        itemData.shop.totalCost = parseInt(totalCostMatch[1]);
        console.log(`  ✓ Total Cost: ${itemData.shop.totalCost}`);
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
    if (categoryText.includes('tier 1 items') && !categoryText.includes('tier 2') && !categoryText.includes('tier 3')) {
      itemData.classification.tier = 1;
    } else if (categoryText.includes('tier 2 items')) {
      itemData.classification.tier = 2;
    } else if (categoryText.includes('tier 3 items')) {
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
    'cooldown rate': 'cooldownRate',
    'in-hand power': 'inhandPower',
    'inhand power': 'inhandPower',
    'lifesteal': 'lifesteal',
    'penetration': 'penetration',
    'physical power': 'physicalPower',
    'magical power': 'magicalPower'
  };

  // Stats are in a single row: <th>Stats:</th> <td>all stats</td>
  // cheerio .text() strips <br> tags, so we replace them with \n first
  rows.each((_i, row) => {
    const $row = $(row);
    const header = $row.find('th').first().text().trim().toLowerCase().replace(/[:.]/g, '').trim();
    const $td = $row.find('td');

    if (header === 'stats' && $td.length) {
      // Replace <br> with newlines, then strip remaining HTML to get text
      const html = $td.html() || '';
      const textWithBreaks = html
        .replace(/<br\s*\/?>/gi, '\n')
        .replace(/<[^>]+>/g, ' ')   // strip remaining HTML tags
        .replace(/&nbsp;/g, ' ');
      const lines = textWithBreaks.split(/\n/).map(l => l.trim()).filter(Boolean);

      for (const line of lines) {
        // Match patterns like "30 Physical Protection", "400 Max Health", "20% Attack Speed"
        const match = line.match(/([\d.]+)%?\s+(.+)/);
        if (match) {
          const value = parseFloat(match[1]);
          const statName = match[2].trim().toLowerCase();
          const jsonKey = statMappings[statName];
          if (jsonKey) {
            itemData.stats[jsonKey] = value;
            console.log(`  ✓ ${statName}: ${value}`);
          } else {
            console.log(`  ? Unknown stat: "${statName}" = ${value}`);
          }
        }
      }
    }
  });

  // ============================================
  // PARSE PASSIVE/ACTIVE EFFECTS
  // ============================================
  console.log('\n⚡ Parsing effects...');

  // Look for passive/active in page headings
  $('h2, h3').each((_i, heading) => {
    const $heading = $(heading);
    const headingText = $heading.text().toLowerCase();

    if (headingText.includes('passive')) {
      const nextP = $heading.next('p');
      if (nextP.length) {
        const text = nextP.text().trim();
        if (text) {
          itemData.details.passive = text;
          console.log(`  ✓ Passive (heading): ${text.substring(0, 50)}...`);
        }
      }
    }

    if (headingText.includes('active')) {
      const nextP = $heading.next('p');
      if (nextP.length) {
        const activeText = nextP.text().trim();
        if (activeText) {
          itemData.details.active = activeText;

          // Extract cooldown from active text
          const cooldownMatch = activeText.match(/cooldown:?\s*(\d+)s?/i);
          if (cooldownMatch) {
            itemData.details.cooldownSeconds = parseInt(cooldownMatch[1]);
          }

          console.log(`  ✓ Active (heading): ${activeText.substring(0, 50)}...`);
          if (itemData.details.cooldownSeconds) {
            console.log(`  ✓ Cooldown: ${itemData.details.cooldownSeconds}s`);
          }
        }
      }
    }
  });

  // Also check infobox for effects (overwrites heading-based if found)
  rows.each((_i, row) => {
    const $row = $(row);
    const header = $row.find('th').text().trim().toLowerCase();
    const data = $row.find('td').text().trim();

    if (header.includes('passive effect') || header === 'passive') {
      if (data) {
        itemData.details.passive = data;
        console.log(`  ✓ Passive (infobox): ${data.substring(0, 50)}...`);
      }
    }

    if (header.includes('active effect') || header === 'active') {
      if (data) {
        itemData.details.active = data;

        // Extract cooldown
        const cooldownMatch = data.match(/cooldown:?\s*(\d+)s?/i);
        if (cooldownMatch) {
          itemData.details.cooldownSeconds = parseInt(cooldownMatch[1]);
          console.log(`  ✓ Cooldown: ${itemData.details.cooldownSeconds}s`);
        }

        console.log(`  ✓ Active (infobox): ${data.substring(0, 50)}...`);
      }
    }
  });

  // Derive effectType from actual content
  const hasPassive = itemData.details.passive && itemData.details.passive.trim().length > 0;
  const hasActive = itemData.details.active && itemData.details.active.trim().length > 0;

  if (hasPassive && hasActive) {
    itemData.classification.effectType = 'both';
  } else if (hasPassive) {
    itemData.classification.effectType = 'passive';
  } else if (hasActive) {
    itemData.classification.effectType = 'active';
  } else {
    itemData.classification.effectType = 'none';
  }
  console.log(`  ✓ Effect type: ${itemData.classification.effectType}`);

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
  if (itemData.stats.cooldownReduction || itemData.stats.cooldownRate) tags.add('cooldown');
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

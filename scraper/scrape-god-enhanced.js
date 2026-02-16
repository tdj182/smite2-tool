// ============================================
// ENHANCED GOD DATA SCRAPER
// Extracts complete god data including abilities
// ============================================

import axios from 'axios';
import * as cheerio from 'cheerio';
import { sanitizeId } from './scrape-utils.js';

export async function scrapeGod(godName) {
  console.log(`\n📥 Scraping ${godName}...`);
  console.log('='.repeat(60));

  const url = `https://wiki.smite2.com/${godName}`;
  const response = await axios.get(url);
  const $ = cheerio.load(response.data);

  // Initialize god data
  const godId = sanitizeId(godName);
  const godData = {
    id: godId,
    name: godName,
    icon: {
      localPath: `/images/gods/${godId}.webp`,
      alt: `${godName} icon`
    },
    identity: {},
    unlock: {
      costDiamonds: null,
      costGodTokens: null,
      isInRotation: null
    },
    baseStats: {},
    aspects: [],
    abilities: [],
    details: {
      summary: null,
      strengths: [],
      weaknesses: [],
      beginnerTips: []
    },
    relationships: {
      uniqueItemIds: [],
      relatedGodIds: []
    },
    history: []
  };

  // ============================================
  // PARSE INFOBOX (Pantheon, Roles, Title)
  // ============================================
  console.log('\n📦 Parsing infobox...');

  const infobox = $('.infobox').first();
  const rows = infobox.find('tr');

  rows.each((_i, row) => {
    const $row = $(row);
    const header = $row.find('th').text().trim().toLowerCase();
    const data = $row.find('td').text().trim();

    if (header.includes('pantheon')) {
      godData.identity.pantheon = data;
      console.log(`  ✓ Pantheon: ${data}`);
    }

    if (header.includes('roles') || header.includes('role')) {
      // Map wiki role names to schema enum values
      const roleMapping = {
        'solo': 'solo',
        'jungle': 'jungle',
        'mid': 'middle',
        'middle': 'middle',
        'adc': 'carry',
        'carry': 'carry',
        'support': 'support'
      };

      const rawRoles = data.toLowerCase().split(/[,\s]+/).filter(r => r.length > 0);
      const mappedRoles = rawRoles.map(r => roleMapping[r] || r).filter(r => r);
      godData.identity.roles = mappedRoles;
      console.log(`  ✓ Roles: ${mappedRoles.join(', ')}`);
    }

    if (header.includes('title')) {
      godData.details.summary = data;
      console.log(`  ✓ Title: ${data}`);
    }
  });

  // ============================================
  // PARSE BASE STATS
  // ============================================
  console.log('\n📊 Parsing stats...');

  const statMappings = {
    'health': 'health',
    'mana': 'mana',
    'health regen': 'healthRegen',
    'mana regen': 'manaRegen',
    'physical pro': 'physicalProtection',
    'physical protection': 'physicalProtection',
    'magical pro': 'magicalProtection',
    'magical protection': 'magicalProtection',
    'attack speed': 'attackSpeed',
    'move speed': 'movementSpeed',
    'movement speed': 'movementSpeed'
  };

  rows.each((_i, row) => {
    const $row = $(row);
    const header = $row.find('th').text().trim().toLowerCase().replace(/[:.]/g, '').trim();
    const data = $row.find('td').text().trim();

    for (const [searchTerm, jsonKey] of Object.entries(statMappings)) {
      if (header === searchTerm) {
        const match = data.match(/([\d.]+)\s*\(?\+?([\d.]+)?\)?/);

        if (match) {
          const baseValue = parseFloat(match[1]);
          const perLevel = match[2] ? parseFloat(match[2]) : 0;

          godData.baseStats[jsonKey] = baseValue;
          godData.baseStats[`${jsonKey}PerLevel`] = perLevel; // Always set, even if 0

          console.log(`  ✓ ${searchTerm}: ${baseValue} (+${perLevel})`);
        }
      }
    }
  });

  // Ensure all required PerLevel stats exist (default to 0)
  const requiredStats = ['health', 'mana', 'healthRegen', 'manaRegen', 'physicalProtection', 'magicalProtection', 'attackSpeed', 'movementSpeed'];
  for (const stat of requiredStats) {
    if (godData.baseStats[stat] !== undefined && godData.baseStats[`${stat}PerLevel`] === undefined) {
      godData.baseStats[`${stat}PerLevel`] = 0;
    }
  }

  // ============================================
  // DETECT DAMAGE TYPE & ATTACK TYPE
  // ============================================
  console.log('\n⚔️ Detecting damage type...');

  const pageText = $('#mw-content-text').text();

  if (pageText.includes('Physical Damage') || pageText.includes('Physical Power')) {
    godData.identity.primaryDamageType = 'physical';
    console.log('  ✓ Primary damage: Physical');
  } else if (pageText.includes('Magical Damage') || pageText.includes('Magical Power')) {
    godData.identity.primaryDamageType = 'magical';
    console.log('  ✓ Primary damage: Magical');
  }

  if (pageText.match(/\bmelee\b/i)) {
    godData.identity.basicAttackType = 'melee';
    godData.identity.rangeClass = 'melee';
    console.log('  ✓ Attack type: Melee');
  } else {
    godData.identity.basicAttackType = 'ranged';
    godData.identity.rangeClass = 'ranged';
    console.log('  ✓ Attack type: Ranged (assumed)');
  }

  godData.identity.scalingProfile = 'hybrid';

  // ============================================
  // PARSE ABILITIES
  // ============================================
  console.log('\n⚡ Parsing abilities...');

  const abilityTables = $('table.wikitable');
  console.log(`  Found ${abilityTables.length} ability tables`);

  abilityTables.each((_i, table) => {
    const $table = $(table);

    // Get ability header (contains name and type)
    const headerCell = $table.find('th[colspan]').first();
    const headerText = headerCell.text();

    // Extract ability name (e.g., "Chain Lightning" from "1st Ability - Chain Lightning | PROJECTILE...")
    const nameMatch = headerText.match(/(?:Passive|Basic Attack|1st Ability|2nd Ability|3rd Ability|Ultimate)\s*-\s*([^|]+)/);

    if (!nameMatch) return; // Skip if no valid ability name

    const abilityName = nameMatch[1].trim();

    // Determine ability key and type
    let key = 'unknown';
    let type = 'ability';
    if (headerText.includes('Passive')) {
      key = 'passive';
      type = 'passive';
    } else if (headerText.includes('Basic Attack')) {
      key = 'basic';
      type = 'basic';
    } else if (headerText.includes('1st Ability')) {
      key = '1';
      type = 'ability';
    } else if (headerText.includes('2nd Ability')) {
      key = '2';
      type = 'ability';
    } else if (headerText.includes('3rd Ability')) {
      key = '3';
      type = 'ability';
    } else if (headerText.includes('Ultimate')) {
      key = '4';
      type = 'ultimate';
    }

    // Get description (second row, second cell)
    const descriptionCell = $table.find('tr').eq(1).find('td').last();
    const description = descriptionCell.text().trim();

    // Parse stats from the bulleted list
    const statsRow = $table.find('tr').eq(2);
    const statsList = statsRow.find('li');

    let cooldownSeconds = null;
    let manaCost = null;
    let scalingText = null;

    statsList.each((_j, li) => {
      const $li = $(li);
      const text = $li.text().trim();

      // Parse scaling: "Damage Scaling: 60% Intelligence"
      if (text.match(/Scaling:/i)) {
        const scalingMatch = text.match(/:\s*(.+)/);
        if (scalingMatch) {
          scalingText = scalingMatch[1].trim();
        }
      }

      // Parse cooldown: "Cooldown: 12 | 11.5 | 11 | 10.5 | 10 seconds"
      // Extract first number as the base cooldown
      if (text.match(/^Cooldown:/i)) {
        const cooldownMatch = text.match(/:\s*([\d.]+)/);
        if (cooldownMatch) {
          cooldownSeconds = parseFloat(cooldownMatch[1]);
        }
      }

      // Parse cost: "Cost: 50 | 55 | 60 | 65 | 70 mana"
      // Extract first number as the base cost
      if (text.match(/^Cost:/i)) {
        const costMatch = text.match(/:\s*([\d.]+)/);
        if (costMatch) {
          manaCost = parseFloat(costMatch[1]);
        }
      }
    });

    // Create ability object matching schema
    const ability = {
      key: key,
      name: abilityName,
      type: type,
      description: description,
      cooldownSeconds: cooldownSeconds,
      manaCost: manaCost,
      scalingText: scalingText
    };

    godData.abilities.push(ability);
    console.log(`  ✓ ${key}: ${abilityName}`);
  });

  console.log('\n✅ Scraping complete!\n');

  return godData;
}

// Test with Zeus (only runs when executed directly, not when imported)
async function main() {
  try {
    const zeusData = await scrapeGod('Zeus');

    // Pretty print the result
    console.log('\n📄 EXTRACTED DATA:');
    console.log('='.repeat(60));
    console.log(JSON.stringify(zeusData, null, 2));

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

// Only run main() if this file is executed directly (not imported)
if (import.meta.url === `file:///${process.argv[1].replace(/\\/g, '/')}`) {
  main();
}

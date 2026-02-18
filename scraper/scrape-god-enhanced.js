// ============================================
// ENHANCED GOD DATA SCRAPER
// Extracts complete god data including abilities
// ============================================

import axios from 'axios';
import * as cheerio from 'cheerio';
import { sanitizeId } from './scrape-utils.js';

/**
 * Parse an ability from a wikitable element.
 * Shared between base abilities and aspect abilities.
 */
function parseAbilityTable($, table) {
  const $table = $(table);

  // Get ability header (contains name and type)
  const headerCell = $table.find('th[colspan]').first();
  const headerText = headerCell.text();

  // Extract ability name (e.g., "Chain Lightning" from "1st Ability - Chain Lightning | PROJECTILE...")
  const nameMatch = headerText.match(/(?:Passive|Basic Attack|1st Ability|2nd Ability|3rd Ability|Ultimate)\s*-\s*([^|]+)/);

  if (!nameMatch) return null;

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
    if (text.match(/^Cooldown:/i)) {
      const cooldownMatch = text.match(/:\s*([\d.]+)/);
      if (cooldownMatch) {
        cooldownSeconds = parseFloat(cooldownMatch[1]);
      }
    }

    // Parse cost: "Cost: 50 | 55 | 60 | 65 | 70 mana"
    if (text.match(/^Cost:/i)) {
      const costMatch = text.match(/:\s*([\d.]+)/);
      if (costMatch) {
        manaCost = parseFloat(costMatch[1]);
      }
    }
  });

  return {
    key,
    name: abilityName,
    type,
    description,
    cooldownSeconds,
    manaCost,
    scalingText
  };
}

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
  // IDENTIFY ASPECT ABILITY TABLES (if any)
  // These must be excluded from base abilities
  // ============================================
  const aspectContainer = $('#mw-customcollapsible-aspectedability');
  const aspectAbilityTableEls = new Set();

  if (aspectContainer.length > 0) {
    aspectContainer.find('.mw-collapsible-content table.wikitable').each((_i, table) => {
      aspectAbilityTableEls.add(table);
    });
    console.log(`\n🔮 Found aspect ability container with ${aspectAbilityTableEls.size} ability tables`);
  }

  // ============================================
  // PARSE BASE ABILITIES
  // Only tables NOT inside the aspect container
  // ============================================
  console.log('\n⚡ Parsing base abilities...');

  const abilityTables = $('table.wikitable');
  console.log(`  Found ${abilityTables.length} total ability tables`);

  abilityTables.each((_i, table) => {
    // Skip tables that belong to the aspect section
    if (aspectAbilityTableEls.has(table)) return;

    const ability = parseAbilityTable($, table);
    if (!ability) return;

    godData.abilities.push(ability);
    console.log(`  ✓ ${ability.key}: ${ability.name}`);
  });

  // ============================================
  // PARSE GOD ASPECTS
  // ============================================
  const aspectHeading = $('h2#God_Aspect');

  if (aspectHeading.length > 0) {
    console.log('\n🔮 Parsing god aspect...');

    // The aspect info table is the first wikitable after the God Aspect heading.
    // In MediaWiki HTML, headings are wrapped in a div.mw-heading, and the
    // content table is a sibling element after that div.
    const headingWrapper = aspectHeading.closest('.mw-heading');
    let aspectInfoTable = null;

    if (headingWrapper.length > 0) {
      // Walk siblings after the heading wrapper to find the first wikitable
      aspectInfoTable = headingWrapper.nextAll('table.wikitable').first();
    }

    if (!aspectInfoTable || aspectInfoTable.length === 0) {
      // Fallback: look for the aspect name styled span near the heading
      aspectInfoTable = aspectHeading.parent().nextAll('table.wikitable').first();
    }

    if (aspectInfoTable && aspectInfoTable.length > 0) {
      // Extract aspect name from the styled span (gold-colored text)
      const aspectName = aspectInfoTable.find('span[style*="color:#d6b68f"]').first().text().trim()
        || aspectInfoTable.find('dd span').first().text().trim();

      // Extract aspect description from the second <dl><dd> in the info cell
      const ddElements = aspectInfoTable.find('td:nth-child(2) dl dd, td:last-child dl dd');
      let aspectDescription = null;
      if (ddElements.length > 1) {
        aspectDescription = ddElements.last().text().trim();
      } else if (ddElements.length === 1) {
        // If only one dd, check if it's separate from the name
        const ddText = ddElements.first().text().trim();
        if (ddText !== aspectName) {
          aspectDescription = ddText;
        }
      }

      const aspectId = sanitizeId(aspectName || `${godName}-aspect`);

      // Parse aspect-enhanced abilities
      const aspectAbilities = [];
      if (aspectContainer.length > 0) {
        aspectContainer.find('.mw-collapsible-content table.wikitable').each((_i, table) => {
          const ability = parseAbilityTable($, table);
          if (ability) {
            aspectAbilities.push(ability);
            console.log(`  ✓ Aspect ability ${ability.key}: ${ability.name}`);
          }
        });
      }

      if (aspectName) {
        const aspect = {
          id: aspectId,
          name: aspectName,
          description: aspectDescription,
          abilities: aspectAbilities
        };

        godData.aspects.push(aspect);
        console.log(`  ✓ Aspect: ${aspectName} (${aspectAbilities.length} enhanced abilities)`);
      }
    }
  }

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
if (process.argv[1] && import.meta.url === `file:///${process.argv[1].replace(/\\/g, '/')}`) {
  main();
}

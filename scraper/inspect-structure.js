// ============================================
// HTML STRUCTURE INSPECTOR
// This helps us understand the page structure
// ============================================

import axios from 'axios';
import * as cheerio from 'cheerio';
import fs from 'fs';

async function inspectZeusPage() {
  console.log('📥 Fetching Zeus page...\n');

  const response = await axios.get('https://wiki.smite2.com/Zeus');
  const $ = cheerio.load(response.data);

  // Save the full HTML to a file so we can inspect it
  fs.writeFileSync('scraper/zeus-page.html', response.data);
  console.log('💾 Saved full HTML to: scraper/zeus-page.html\n');

  // Let's find the infobox and print its structure
  const infobox = $('.infobox').first();

  if (infobox.length > 0) {
    console.log('📦 INFOBOX STRUCTURE:');
    console.log('='.repeat(50));

    // Get all rows in the infobox
    const rows = infobox.find('tr');
    console.log(`Found ${rows.length} rows in infobox\n`);

    // Print first 10 rows to see the pattern
    rows.slice(0, 10).each((i, row) => {
      const $row = $(row);
      const th = $row.find('th').text().trim();
      const td = $row.find('td').text().trim();

      if (th || td) {
        console.log(`Row ${i}:`);
        if (th) console.log(`  Header: ${th}`);
        if (td) console.log(`  Data: ${td.substring(0, 100)}`);
        console.log();
      }
    });
  }

  // Look for ability information
  console.log('\n⚡ ABILITIES SECTION:');
  console.log('='.repeat(50));

  // Try to find ability tables
  const abilityTables = $('table').filter((i, table) => {
    const text = $(table).text();
    return text.includes('Damage') || text.includes('Cooldown') || text.includes('Cost');
  });

  console.log(`Found ${abilityTables.length} potential ability tables\n`);

  // Look for all headings to see page structure
  console.log('\n📑 PAGE HEADINGS:');
  console.log('='.repeat(50));

  $('h1, h2, h3, h4').each((i, elem) => {
    const $elem = $(elem);
    const level = elem.name;
    const text = $elem.text().trim();
    const id = $elem.attr('id') || $elem.find('.mw-headline').attr('id');

    if (text && text.length < 100) {
      console.log(`${level.toUpperCase()}: ${text}${id ? ` [id="${id}"]` : ''}`);
    }
  });

  // Look for stat icons pattern
  console.log('\n\n📊 LOOKING FOR STAT PATTERNS:');
  console.log('='.repeat(50));

  // Find elements with "Health", "Mana", etc.
  const statsKeywords = ['Health', 'Mana', 'Physical Protection', 'Magical Protection', 'Attack Speed'];

  statsKeywords.forEach(keyword => {
    const elements = $('*').filter((i, elem) => {
      const text = $(elem).text();
      return text.includes(keyword) && text.length < 100;
    });

    if (elements.length > 0) {
      const firstMatch = elements.first();
      console.log(`\n"${keyword}" found in: <${firstMatch.prop('tagName')}>`);
      console.log(`  Text: ${firstMatch.text().trim()}`);
      console.log(`  Classes: ${firstMatch.attr('class') || 'none'}`);
    }
  });

  console.log('\n\n✅ Inspection complete! Check zeus-page.html for full source.');
}

inspectZeusPage().catch(error => {
  console.error('❌ Error:', error.message);
});

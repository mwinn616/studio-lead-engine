import 'dotenv/config';
import { searchLeads } from './src/scrape.js';
import { cleanLeads } from './src/clean.js';
import { writeLeads } from './src/airtable.js';

const [businessType, market] = process.argv.slice(2);

if (!businessType || !market) {
  console.error('Usage: node index.js "<business type>" "<market>"');
  console.error('Example: node index.js "photo studio" "Tulsa OK"');
  process.exit(1);
}

console.log(`\nSearching: "${businessType}" in ${market}\n`);

const raw = await searchLeads(businessType, market);
const leads = cleanLeads(raw, businessType, market);

console.log(`Found ${leads.length} leads. Checking for duplicates...\n`);

const { added, skipped } = await writeLeads(leads);

console.log(`\nDone — ${added} added, ${skipped} skipped.`);

import axios from 'axios';

const BASE_URL = `https://api.airtable.com/v0/${process.env.AIRTABLE_BASE_ID}/${encodeURIComponent(process.env.AIRTABLE_TABLE_NAME)}`;

const headers = {
  Authorization: `Bearer ${process.env.AIRTABLE_API_KEY}`,
  'Content-Type': 'application/json',
};

/**
 * Check if a record with this Business Name + Market already exists.
 * @param {string} name
 * @param {string} market
 * @returns {Promise<boolean>}
 */
async function exists(name, market) {
  const formula = `AND({Business Name}="${name.replace(/"/g, '\\"')}",{Market}="${market.replace(/"/g, '\\"')}")`;
  const response = await axios.get(BASE_URL, {
    headers,
    params: { filterByFormula: formula, maxRecords: 1, fields: ['Business Name'] },
  });
  return response.data.records.length > 0;
}

/**
 * Write leads to Airtable, skipping any that already exist.
 * @param {Array} leads - Cleaned lead objects from clean.js
 * @returns {Promise<{added: number, skipped: number}>}
 */
export async function writeLeads(leads) {
  let added = 0;
  let skipped = 0;

  for (const lead of leads) {
    const duplicate = await exists(lead['Business Name'], lead['Market']);

    if (duplicate) {
      console.log(`  SKIP  ${lead['Business Name']} (already in Airtable)`);
      skipped++;
      continue;
    }

    await axios.post(BASE_URL, { fields: lead }, { headers });
    console.log(`  ADD   ${lead['Business Name']}`);
    added++;
  }

  return { added, skipped };
}

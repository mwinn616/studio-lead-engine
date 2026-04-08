/**
 * Normalize raw Serper maps results into Airtable-ready lead records.
 * Deduplicates by Business Name + Market within the batch.
 * @param {Array} results - Raw places from Serper
 * @param {string} businessType - e.g. "photo studio"
 * @param {string} market - e.g. "Tulsa OK"
 * @returns {Array} Cleaned, deduplicated lead objects
 */
export function cleanLeads(results, businessType, market) {
  const today = new Date().toISOString().split('T')[0];
  const seen = new Set();

  const leads = [];

  for (const result of results) {
    const name = (result.title ?? '').trim();
    const dedupKey = `${name.toLowerCase()}|${market.toLowerCase()}`;

    if (!name || seen.has(dedupKey)) continue;
    seen.add(dedupKey);

    leads.push({
      'Business Name': name,
      'Website': result.website ?? '',
      'Phone': result.phoneNumber ?? '',
      'Address': result.address ?? '',
      'Market': market,
      'Category': businessType,
      'Source': 'Serper',
      'Status': 'New',
      'Date Added': today,
      'Notes': '',
    });
  }

  return leads;
}

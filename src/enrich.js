import 'dotenv/config';
import axios from 'axios';
import Anthropic from '@anthropic-ai/sdk';
import { parse } from 'node-html-parser';

const BASE_URL = `https://api.airtable.com/v0/${process.env.AIRTABLE_BASE_ID}/${encodeURIComponent(process.env.AIRTABLE_TABLE_NAME)}`;

const airtableHeaders = {
  Authorization: `Bearer ${process.env.AIRTABLE_API_KEY}`,
  'Content-Type': 'application/json',
};

const claude = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

/**
 * Fetch all records where Hook Status is empty.
 */
async function getLeadsToEnrich() {
  const formula = encodeURIComponent(`{Hook Status}=""`);
  const fields = ['Business Name', 'Website']
    .map((f) => `fields[]=${encodeURIComponent(f)}`)
    .join('&');

  const response = await axios.get(
    `${BASE_URL}?filterByFormula=${formula}&${fields}`,
    { headers: airtableHeaders }
  );

  return response.data.records;
}

/**
 * Fetch a website URL and strip it down to plain readable text, max 2000 chars.
 */
async function fetchWebsiteText(url) {
  const response = await axios.get(url, {
    timeout: 10_000,
    headers: { 'User-Agent': 'Mozilla/5.0' },
  });

  const root = parse(response.data);
  root.querySelectorAll('script, style, noscript').forEach((el) => el.remove());

  return root.text.replace(/\s+/g, ' ').trim().slice(0, 2000);
}

/**
 * Send website text to Claude and get a personalized outreach hook.
 */
async function generateHook(websiteText) {
  const response = await claude.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 512,
    messages: [
      {
        role: 'user',
        content:
          `Website content:\n${websiteText}\n\n` +
          `you are writing the opening paragraph of a cold outreach email from a web designer named Mark Winn to a photo studio owner. ` +
          `Write a single short paragraph of 2-3 sentences that opens with something specific and genuine about their studio, ` +
          `does not mention pricing or services yet, sounds human not like a template, and ends with a natural transition into why you're reaching out. ` +
          `Return only the paragraph, nothing else.`,
      },
    ],
  });

  return response.content[0].text.trim();
}

/**
 * Patch a single Airtable record.
 */
async function updateRecord(recordId, fields) {
  await axios.patch(
    `${BASE_URL}/${recordId}`,
    { fields },
    { headers: airtableHeaders }
  );
}

// --- Main ---

const records = await getLeadsToEnrich();
console.log(`Found ${records.length} lead(s) to enrich.\n`);

let generated = 0;
let failed = 0;

for (const record of records) {
  const name = record.fields['Business Name'];
  const website = record.fields['Website'];

  process.stdout.write(`  ${name}... `);

  if (!website) {
    await updateRecord(record.id, { 'Hook Status': 'Failed' });
    console.log('✗ (no website)');
    failed++;
    continue;
  }

  try {
    const text = await fetchWebsiteText(website);
    const hook = await generateHook(text);
    await updateRecord(record.id, {
      'AI Outreach Hook': hook,
      'Hook Status': 'Generated',
    });
    console.log('✓');
    generated++;
  } catch (err) {
    await updateRecord(record.id, { 'Hook Status': 'Failed' });
    console.log(`✗ (${err.message.slice(0, 80)})`);
    failed++;
  }
}

console.log(`\nDone — ${generated} generated, ${failed} failed.`);

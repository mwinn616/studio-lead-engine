# Studio Lead Engine

A lightweight CLI tool that searches for local business leads using the Serper Google Maps API and writes them directly to Airtable — with automatic deduplication.

Built with zero heavy frameworks. Just `axios` and `dotenv`.

## What It Does

1. Queries Serper's `/maps` endpoint to find local businesses (returns structured address, phone, and website data from Google Maps)
2. Normalizes the results into a consistent shape
3. Checks Airtable for duplicates before writing
4. Logs every add and skip with a summary at the end

## Usage

```bash
node index.js "<business type>" "<market>"
```

**Examples:**
```bash
node index.js "photo studio" "Tulsa OK"
node index.js "recording studio" "Austin TX"
node index.js "podcast studio" "Oklahoma City OK"
```

**Output:**
```
Searching: "photo studio" in Tulsa OK

Found 20 leads. Checking for duplicates...

  ADD   Bold Studio Tulsa
  ADD   Scissor Tail Studio Tulsa
  SKIP  Apertures Photo (already in Airtable)
  ...

Done — 18 added, 2 skipped.
```

## Setup

### 1. Clone and install

```bash
git clone https://github.com/YOUR_USERNAME/studio-lead-engine.git
cd studio-lead-engine
npm install
```

### 2. Create a `.env` file

```
SERPER_API_KEY=your_serper_key
AIRTABLE_API_KEY=your_airtable_pat
AIRTABLE_BASE_ID=appXXXXXXXXXX
AIRTABLE_TABLE_NAME=Leads
```

- **Serper API key** → [serper.dev](https://serper.dev)
- **Airtable PAT** → [airtable.com/create/tokens](https://airtable.com/create/tokens) — needs `data.records:read`, `data.records:write`, and `schema.bases:read` scopes

### 3. Airtable table schema

Your Airtable table needs these fields:

| Field | Type |
|---|---|
| Business Name | Single line text |
| Website | URL |
| Phone | Phone number |
| Address | Single line text |
| Market | Single line text |
| Category | Single line text |
| Source | Single line text |
| Status | Single select |
| Date Added | Date |
| Notes | Long text |

## Project Structure

```
studio-lead-engine/
├── .env                 # API keys (never committed)
├── .gitignore
├── package.json
├── index.js             # CLI entry point
└── src/
    ├── scrape.js        # Serper /maps query
    ├── clean.js         # Data normalization + deduplication
    └── airtable.js      # Airtable REST API writes
```
# studio-lead-engine

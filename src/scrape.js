import axios from 'axios';

/**
 * Fetch local business results from Serper's Google Maps endpoint.
 * @param {string} businessType - e.g. "photo studio"
 * @param {string} market - e.g. "Tulsa OK"
 * @returns {Promise<Array>} Raw maps results
 */
export async function searchLeads(businessType, market) {
  const query = `"${businessType}" "${market}"`;

  const response = await axios.post(
    'https://google.serper.dev/maps',
    { q: query },
    {
      headers: {
        'X-API-KEY': process.env.SERPER_API_KEY,
        'Content-Type': 'application/json',
      },
    }
  );

  return response.data.places ?? [];
}

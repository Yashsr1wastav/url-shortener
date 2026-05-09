export async function getCountryFromIp(ip) {
  try {
    if (!ip) return 'Unknown';
    const url = `http://ip-api.com/json/${encodeURIComponent(ip)}?fields=country`;
    const res = await fetch(url, { method: 'GET' });
    if (!res.ok) return 'Unknown';
    const data = await res.json();
    return data && data.country ? data.country : 'Unknown';
  } catch (err) {
    console.error('GeoIP lookup failed', err);
    return 'Unknown';
  }
}

export async function getCountryFromIp(ip) {
  try {
    if (
      !ip ||
      ip === '127.0.0.1' ||
      ip === '::1' ||
      ip.startsWith('192.168.') ||
      ip.startsWith('10.') ||
      ip.startsWith('172.') ||
      ip === '::ffff:127.0.0.1'
    ) {
      return 'Local';
    }

    const cleanIp = ip.replace('::ffff:', '');

    const res = await fetch(
      `http://ip-api.com/json/${cleanIp}?fields=status,country`,
      { signal: AbortSignal.timeout(2000) }
    );
    const data = await res.json();
    if (data.status === 'success' && data.country) {
      return data.country;
    }
    return 'Unknown';
  } catch (err) {
    return 'Unknown';
  }
}

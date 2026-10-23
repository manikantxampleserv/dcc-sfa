const ipCache = new Map<string, string>();

export const getLocationFromIPs = async (
  rawIps: (string | null | undefined)[]
): Promise<Record<string, string>> => {
  const validIps = rawIps.filter((ip): ip is string => Boolean(ip));

  const uniqueStrippedIps = [
    ...new Set(validIps.map(ip => ip.replace(/^::ffff:/, ''))),
  ].filter(
    ip =>
      ip !== '127.0.0.1' &&
      ip !== '::1' &&
      !ip.startsWith('192.168.') &&
      !ip.startsWith('10.') &&
      !ipCache.has(ip)
  );

  if (uniqueStrippedIps.length > 0) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 1500);

      const response = await fetch('http://ip-api.com/batch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify(
          uniqueStrippedIps.map(ip => ({
            query: ip,
            fields: 'query,city,regionName,country,status',
          }))
        ),
      });

      clearTimeout(timeoutId);

      if (response.ok) {
        const data = await response.json();
        data.forEach((res: any) => {
          if (res.status === 'success') {
            const loc = `${res.city || 'Unknown City'}, ${res.regionName || 'Unknown Region'}, ${res.country || 'Unknown Country'}`;
            ipCache.set(res.query, loc);
          }
        });
      }
    } catch (error) {
      console.error('Error fetching from live IP API:', error);
    }
  }

  const finalMap: Record<string, string> = {};
  validIps.forEach(originalIp => {
    const strippedIp = originalIp.replace(/^::ffff:/, '');

    if (
      strippedIp === '127.0.0.1' ||
      strippedIp === '::1' ||
      strippedIp.startsWith('192.168.') ||
      strippedIp.startsWith('10.')
    ) {
      finalMap[originalIp] = 'Local Network';
    } else if (ipCache.has(strippedIp)) {
      finalMap[originalIp] = ipCache.get(strippedIp)!;
    } else {
      finalMap[originalIp] = 'Unknown';
    }
  });

  return finalMap;
};

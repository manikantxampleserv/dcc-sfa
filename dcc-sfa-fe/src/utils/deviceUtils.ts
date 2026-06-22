export const formatDeviceInfo = (
  deviceInfo: string | null | undefined
): string => {
  if (!deviceInfo) return 'Unknown device';

  const info = deviceInfo.toLowerCase();

  if (info.includes('macintosh') || info.includes('mac os x')) {
    const osMatch = deviceInfo.match(/Mac OS X (\d+[._]\d+[._]\d+)/);
    const osVersion = osMatch ? osMatch[1].replace(/_/g, '.') : '';

    if (info.includes('chrome')) {
      return `Mac${osVersion ? ` (macOS ${osVersion})` : ''} - Chrome`;
    }
    if (info.includes('safari') && !info.includes('chrome')) {
      return `Mac${osVersion ? ` (macOS ${osVersion})` : ''} - Safari`;
    }
    if (info.includes('firefox')) {
      return `Mac${osVersion ? ` (macOS ${osVersion})` : ''} - Firefox`;
    }
  }

  if (info.includes('windows')) {
    let windowsVersion = '';
    if (info.includes('windows nt 10.0')) {
      windowsVersion = 'Windows 10';
    } else if (info.includes('windows nt 11.0')) {
      windowsVersion = 'Windows 11';
    } else if (info.includes('windows nt 6.3')) {
      windowsVersion = 'Windows 8.1';
    } else if (info.includes('windows nt 6.2')) {
      windowsVersion = 'Windows 8';
    } else if (info.includes('windows nt 6.1')) {
      windowsVersion = 'Windows 7';
    } else {
      const winMatch = deviceInfo.match(/Windows NT (\d+\.\d+)/i);
      if (winMatch) {
        const ntVersion = winMatch[1];
        if (ntVersion === '10.0') windowsVersion = 'Windows 10';
        else if (ntVersion === '11.0') windowsVersion = 'Windows 11';
        else if (ntVersion === '6.3') windowsVersion = 'Windows 8.1';
        else if (ntVersion === '6.2') windowsVersion = 'Windows 8';
        else if (ntVersion === '6.1') windowsVersion = 'Windows 7';
        else windowsVersion = `Windows NT ${ntVersion}`;
      } else {
        windowsVersion = 'Windows';
      }
    }

    if (info.includes('chrome')) {
      return `${windowsVersion} - Chrome`;
    }
    if (info.includes('firefox')) {
      return `${windowsVersion} - Firefox`;
    }
    if (info.includes('edge')) {
      return `${windowsVersion} - Edge`;
    }
    return windowsVersion;
  }

  if (info.includes('android')) {
    if (info.includes('chrome')) return 'Android - Chrome';
  }

  if (info.includes('iphone') || info.includes('ipad')) {
    if (info.includes('safari')) return 'iOS - Safari';
  }

  if (info.includes('dart')) {
    return 'Mobile App';
  }

  return deviceInfo;
};

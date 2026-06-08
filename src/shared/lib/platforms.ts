const fallbackPlatformIcon = 'bs:display'

const normalizePlatformKey = (name: string): string =>
  name.trim().toLowerCase().replace(/\s+/g, ' ')

const platformIcons: Record<string, string> = {
  android: 'bs:android',
  ios: 'bs:phone',
  linux: 'bs:ubuntu',
  mac: 'bs:apple',
  'mac os': 'bs:apple',
  macos: 'bs:apple',
  pc: 'bs:windows',
  playstation: 'bs:playstation',
  ps: 'bs:playstation',
  win: 'bs:windows',
  windows: 'bs:windows',
  xbox: 'bs:xbox',
}

const platformLabels: Record<string, string> = {
  android: 'Android',
  ios: 'iOS',
  linux: 'Linux',
  mac: 'macOS',
  'mac os': 'macOS',
  macos: 'macOS',
  pc: 'Windows',
  playstation: 'PlayStation',
  ps: 'PlayStation',
  win: 'Windows',
  windows: 'Windows',
  xbox: 'Xbox',
}

export const getPlatformIcon = (name: string): string =>
  platformIcons[normalizePlatformKey(name)] ?? fallbackPlatformIcon

export const getPlatformLabel = (name: string): string =>
  platformLabels[normalizePlatformKey(name)] ?? name

export const isPlatformTagType = (type: string): boolean =>
  ['platform', 'platforma', 'platforms'].includes(normalizePlatformKey(type))

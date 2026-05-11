const absoluteUrlPattern = /^[a-z][a-z\d+\-.]*:\/\//i

export const buildAssetUrl = (path: string | null | undefined, baseUrl: string): string | null => {
  const assetPath = path?.trim()

  if (!assetPath) {
    return null
  }

  if (absoluteUrlPattern.test(assetPath) || assetPath.startsWith('//')) {
    return assetPath
  }

  const normalizedBaseUrl = baseUrl.replace(/\/+$/, '')
  const normalizedPath = assetPath.replace(/^\/+/, '')

  if (!normalizedBaseUrl) {
    return normalizedPath
  }

  return `${normalizedBaseUrl}/${normalizedPath}`
}

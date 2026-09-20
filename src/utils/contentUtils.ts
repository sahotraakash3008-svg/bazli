import { SiteContentConfig } from '../types';
import { DEFAULT_SITE_CONTENT } from '../data/initialData';

/**
 * Resolves a text string taking into account:
 * 1. Direct configured property in SiteContentConfig
 * 2. Any arbitrary custom text overrides defined by the admin
 */
export function resolveSiteText(
  originalText: string,
  configuredValue?: string,
  contentConfig?: SiteContentConfig
): string {
  // If a direct configured value is provided and not empty, use it
  let result = (configuredValue && configuredValue.trim()) ? configuredValue : originalText;

  // Check custom overrides map if config exists
  if (contentConfig?.customTextOverrides && Object.keys(contentConfig.customTextOverrides).length > 0) {
    if (contentConfig.customTextOverrides[originalText]) {
      return contentConfig.customTextOverrides[originalText];
    }
    if (contentConfig.customTextOverrides[result]) {
      return contentConfig.customTextOverrides[result];
    }
  }

  return result;
}

const STORAGE_KEY = 'bazli_site_content_config_v1';

export function loadStoredSiteContent(): SiteContentConfig {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      return {
        ...DEFAULT_SITE_CONTENT,
        ...parsed,
        customTextOverrides: {
          ...(DEFAULT_SITE_CONTENT.customTextOverrides || {}),
          ...(parsed.customTextOverrides || {})
        }
      };
    }
  } catch (err) {
    console.error('Failed to load stored site content:', err);
  }
  return { ...DEFAULT_SITE_CONTENT };
}

export function saveStoredSiteContent(config: SiteContentConfig): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
  } catch (err) {
    console.error('Failed to save site content to storage:', err);
  }
}

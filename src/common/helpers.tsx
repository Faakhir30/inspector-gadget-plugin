export const IS_METRIC = 'isMetric';
export const HEADLAMP_KEY = 'headlamp_key';
export const HEADLAMP_VALUE = 'headlamp_value';
export const HEADLAMP_METRIC_UNIT = 'headlamp_metric_unit';

/** Field flag: hidden by default (aligned with ig-desktop). */
export const FIELD_FLAG_HIDDEN = 0x04;

export function visibilityKey(imageName: string, dsName: string): string {
  return `columnVisibility:${imageName}:${dsName}`;
}

export function getHiddenFields(
  ds: { name: string; fields?: Array<{ fullName: string; flags?: number }> },
  options?: {
    imageName?: string;
    getVisibilityOverrides?: (key: string) => string[] | undefined;
  }
): Set<string> {
  const defaultHidden = new Set(
    (ds.fields || [])
      .filter(f => ((f.flags ?? 0) & FIELD_FLAG_HIDDEN) !== 0)
      .map(f => f.fullName)
  );

  if (!options?.imageName || !options?.getVisibilityOverrides) return defaultHidden;

  const key = visibilityKey(options.imageName, ds.name);
  const overrides = options.getVisibilityOverrides(key);
  if (!overrides) return defaultHidden;

  const result = new Set(defaultHidden);
  for (const fieldName of overrides) {
    if (result.has(fieldName)) result.delete(fieldName);
    else result.add(fieldName);
  }
  return result;
}

export function getVisibleFieldNames(
  ds: { name: string; fields?: Array<{ fullName: string; flags?: number }> },
  options?: {
    imageName?: string;
    getVisibilityOverrides?: (key: string) => string[] | undefined;
    excludeK8s?: boolean;
  }
): string[] {
  const hidden = getHiddenFields(ds, options);
  const visible = (ds.fields || [])
    .filter(f => !hidden.has(f.fullName))
    .map(f => f.fullName);
  const excludeK8s = options?.excludeK8s !== false;
  return excludeK8s ? visible.filter(n => n !== 'k8s') : visible;
}

export function generateRandomString(length: number = 6): string {
  const characters = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
}

export function updateInstanceFromStorage(
  id,
  embedView = 'None',
  isHeadless = false,
  paramValues = {}
) {
  const embeddedInstances = JSON.parse(localStorage.getItem('headlamp_embeded_resources') || '[]');
  const instance = embeddedInstances.find(instance => instance.id === id);

  if (instance) {
    const updatedInstances = embeddedInstances.filter(instance => instance.id !== id);
    localStorage.setItem('headlamp_embeded_resources', JSON.stringify(updatedInstances));

    instance.isHeadless = isHeadless; // Update isHeadless property
    if (embedView !== 'None') {
      instance.kind = embedView; // Update kind with embedView
      instance.isEmbedded = true; // Mark as embedded
    } else {
      delete instance.kind; // Remove kind if embedView is 'None'
      instance.isEmbedded = false; // Mark as non-embedded
    }
    instance.gadgetConfig.paramValues = paramValues; // Update paramValues

    const updatedEmbeddedInstances = [...updatedInstances, instance];
    localStorage.setItem('headlamp_embeded_resources', JSON.stringify(updatedEmbeddedInstances));
    return instance;
  }

  return null;
}

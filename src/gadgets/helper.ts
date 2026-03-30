export const IG_CONTAINER_KEY = 'k8s-app';
export const IG_CONTAINER_VALUE = 'gadget';

export function isIGPod(podResource) {
  if (!podResource.metadata.labels) {
    return false;
  }
  return podResource?.metadata?.labels[IG_CONTAINER_KEY] === IG_CONTAINER_VALUE;
}

export function removeDuplicates(array) {
  const uniqueObjects = array.reduce((acc, obj) => {
    const existingObj = acc.find(item => item.key === obj.key);
    if (!existingObj) {
      acc.push(obj);
    }
    return acc;
  }, []);

  return uniqueObjects;
}

export function getProperty(obj, key) {
  const keys = key.split('.');
  return keys.reduce((acc, curr) => acc && acc[curr], obj);
}

/**
 * Alternate JSON keys seen on the wire (Go/json tags) vs schema fullName (camelCase).
 * Fixes empty gadgetID / gadgetName / gadgetImage cells when keys are snake_case or mixed case.
 */
const GADGET_FIELD_ALIASES: Record<string, string[]> = {
  gadgetID: ['gadget_id', 'gadgetId', 'GadgetID'],
  gadgetName: ['gadget_name', 'gadgetname', 'GadgetName'],
  gadgetImage: ['gadget_image', 'gadgetimage', 'GadgetImage'],
  nodeName: ['node_name', 'nodename', 'NodeName'],
  progID: ['prog_id', 'progId', 'ProgID'],
  progName: ['prog_name', 'progname', 'ProgName'],
  progType: ['prog_type', 'progtype', 'ProgType'],
};

/** Dotted paths (nested structs / alternate JSON shapes). */
const GADGET_FIELD_NESTED: Record<string, string[]> = {
  gadgetID: ['gadget.gadgetID', 'gadget.gadget_id', 'Gadget.GadgetID'],
  gadgetName: ['gadget.gadgetName', 'gadget.gadget_name'],
  gadgetImage: ['gadget.gadgetImage', 'gadget.gadget_image'],
};

function nonEmpty(v: unknown): boolean {
  return v != null && String(v).trim() !== '';
}

/**
 * Resolve a datasource field value when JSON keys differ from schema fullName.
 */
export function getGadgetFieldValue(obj: Record<string, unknown> | null | undefined, column: string): unknown {
  if (obj == null || column == null) return undefined;

  const direct = getProperty(obj, column);
  if (direct !== undefined && direct !== null) return direct;

  const o = obj as Record<string, unknown>;
  const alts = GADGET_FIELD_ALIASES[column];
  if (alts) {
    for (const k of alts) {
      if (Object.prototype.hasOwnProperty.call(o, k)) {
        const v = o[k];
        if (v !== undefined && v !== null) return v;
      }
    }
  }

  const nested = GADGET_FIELD_NESTED[column];
  if (nested) {
    for (const path of nested) {
      const v = getProperty(obj, path);
      if (v !== undefined && v !== null) return v;
    }
  }

  if (typeof obj === 'object' && !Array.isArray(obj)) {
    const lower = column.toLowerCase();
    const key = Object.keys(o).find(k => k.toLowerCase() === lower);
    if (key !== undefined) return o[key];
  }

  return undefined;
}

/**
 * Fill gadgetID / gadgetName / gadgetImage from running instances (same sources as Gadgets table:
 * `listGadgetInstances` + localStorage) when the bpfstats event omits them or uses different keys.
 */
export function enrichBpfstatsRowWithGadgetInstances(
  row: Record<string, unknown>,
  instances: Array<{
    id?: string;
    name?: string;
    imageName?: string;
    gadgetConfig?: { imageName?: string };
    cluster?: string;
  }>,
  cluster?: string
): Record<string, unknown> {
  const out = { ...row };
  const instList = cluster
    ? instances.filter(i => i.cluster === cluster || !i.cluster)
    : instances;

  const nestedGadget = out.gadget as Record<string, unknown> | undefined;
  const gidRaw =
    out.gadgetID ??
    out.gadget_id ??
    out.gadgetId ??
    out.GadgetID ??
    nestedGadget?.ID ??
    nestedGadget?.id;
  const gid = gidRaw != null ? String(gidRaw).trim() : '';

  const findById = () => {
    if (!gid) return null;
    return instList.find(inst => {
      if (!inst?.id) return false;
      const iid = String(inst.id);
      return iid === gid || iid.startsWith(gid) || gid.startsWith(iid.slice(0, Math.min(16, gid.length)));
    });
  };

  let inst = findById();

  if (!inst && instList.length === 1 && !gid) {
    const pn = String(out.progName ?? out.prog_name ?? out.ProgName ?? '').toLowerCase();
    if (pn.includes('ig_') || pn.includes('gadget')) {
      inst = instList[0];
    }
  }

  if (!inst) return out;

  if (!nonEmpty(out.gadgetID) && !nonEmpty(out.gadget_id)) {
    out.gadgetID = inst.id;
  }
  if (!nonEmpty(out.gadgetName)) {
    out.gadgetName = inst.name ?? inst.gadgetConfig?.imageName ?? '';
  }
  if (!nonEmpty(out.gadgetImage)) {
    out.gadgetImage = inst.imageName ?? inst.gadgetConfig?.imageName ?? '';
  }

  return out;
}

export const createIdentifier = (identifier, value) =>
  `headlamp_${JSON.stringify({ [identifier]: value })}`;

// Parsing the string
export const parseIdentifier = str => {
  const jsonPart = str.replace('headlamp_', '');
  return JSON.parse(jsonPart);
};

export const isIdentifier = str => str.startsWith('headlamp_');

export function isElectron() {
  if (
    typeof window !== 'undefined' &&
    typeof window.process === 'object' &&
    (window.process as any).type === 'renderer'
  ) {
    return true;
  }

  // Main process
  if (
    typeof process !== 'undefined' &&
    typeof process.versions === 'object' &&
    !!(process.versions as any).electron
  ) {
    return true;
  }

  // Detect the user agent when the `nodeIntegration` option is set to true
  if (
    typeof navigator === 'object' &&
    typeof navigator.userAgent === 'string' &&
    navigator.userAgent.indexOf('Electron') >= 0
  ) {
    return true;
  }

  return false;
}

export function isDockerDesktop(): boolean {
  if (window?.ddClient === undefined) {
    return false;
  }
  return true;
}

export function getServerURL() {
  if (isDockerDesktop()) {
    return 'http://localhost:64446';
  }
  return 'http://localhost:4466';
}

import { getState, updateState } from './state.js';

function normalizeString(value) {
  return typeof value === 'string' && value.trim().length > 0
    ? value.trim()
    : '';
}

function ensureStore() {
  const state = getState();
  if (!state.devDisabledEntries || typeof state.devDisabledEntries !== 'object') {
    state.devDisabledEntries = {};
  }
  return state.devDisabledEntries;
}

function cloneStore(store) {
  const result = {};
  Object.entries(store || {}).forEach(([type, values]) => {
    result[type] = Array.isArray(values) ? values.slice() : [];
  });
  return result;
}

export function getDevDisabledKeys(type) {
  const normalizedType = normalizeString(type);
  if (!normalizedType) {
    return [];
  }
  const store = ensureStore();
  const values = store[normalizedType];
  return Array.isArray(values) ? values.slice() : [];
}

export function isDevEntryDisabled(type, key) {
  const normalizedType = normalizeString(type);
  const normalizedKey = normalizeString(key);
  if (!normalizedType || !normalizedKey) {
    return false;
  }
  const store = ensureStore();
  const values = store[normalizedType];
  if (!Array.isArray(values) || values.length === 0) {
    return false;
  }
  return values.includes(normalizedKey);
}

export function setDevEntryDisabled(type, key, disabled = true) {
  const normalizedType = normalizeString(type);
  const normalizedKey = normalizeString(key);
  if (!normalizedType || !normalizedKey) {
    return false;
  }
  const store = ensureStore();
  const currentValues = Array.isArray(store[normalizedType])
    ? store[normalizedType]
    : [];
  const hasValue = currentValues.includes(normalizedKey);

  if (disabled) {
    if (hasValue) {
      return true;
    }
    const nextStore = cloneStore(store);
    nextStore[normalizedType] = [...currentValues, normalizedKey];
    updateState({ devDisabledEntries: nextStore });
    return true;
  }

  if (!hasValue) {
    return false;
  }
  const filtered = currentValues.filter((value) => value !== normalizedKey);
  const nextStore = cloneStore(store);
  if (filtered.length > 0) {
    nextStore[normalizedType] = filtered;
  } else {
    delete nextStore[normalizedType];
  }
  updateState({ devDisabledEntries: nextStore });
  return false;
}

export function toggleDevEntryDisabled(type, key) {
  const isDisabled = isDevEntryDisabled(type, key);
  return setDevEntryDisabled(type, key, !isDisabled);
}

function setDevDisabledKeysInternal(type, keys) {
  const normalizedType = normalizeString(type);
  if (!normalizedType) {
    return;
  }
  const store = ensureStore();
  const nextStore = cloneStore(store);
  const normalizedKeys = Array.isArray(keys)
    ? Array.from(
        new Set(
          keys
            .map((value) => normalizeString(value))
            .filter((value) => value.length > 0)
        )
      )
    : [];
  if (normalizedKeys.length > 0) {
    nextStore[normalizedType] = normalizedKeys;
  } else {
    delete nextStore[normalizedType];
  }
  updateState({ devDisabledEntries: nextStore });
}

export function setDevDisabledKeys(type, keys) {
  setDevDisabledKeysInternal(type, keys);
}

export function toggleDevEntriesForType(type, keys) {
  const normalizedType = normalizeString(type);
  if (!normalizedType) {
    return false;
  }
  const validKeys = Array.isArray(keys)
    ? keys.map((key) => normalizeString(key)).filter((key) => key)
    : [];
  if (validKeys.length === 0) {
    return false;
  }
  const current = getDevDisabledKeys(normalizedType);
  const allDisabled = validKeys.every((key) => current.includes(key));
  if (allDisabled) {
    const remaining = current.filter((key) => !validKeys.includes(key));
    setDevDisabledKeysInternal(normalizedType, remaining);
    return false;
  }
  const combined = Array.from(new Set([...current, ...validKeys]));
  setDevDisabledKeysInternal(normalizedType, combined);
  return true;
}

export function filterDevDisabledEntries(type, entries, getKey) {
  if (!Array.isArray(entries) || entries.length === 0) {
    return [];
  }
  const keyResolver = typeof getKey === 'function' ? getKey : (item) => item?.key;
  return entries.filter((entry) => {
    const entryKey = normalizeString(keyResolver(entry));
    if (!entryKey) {
      return true;
    }
    return !isDevEntryDisabled(type, entryKey);
  });
}


export const STORAGE_PREFIX = "kidapp.v1";

export const storageKeys = {
  pictureMatch: {
    progress: `${STORAGE_PREFIX}.pictureMatch.progress`,
    settings: `${STORAGE_PREFIX}.pictureMatch.settings`,
  },
  abacus: {
    progress: `${STORAGE_PREFIX}.abacus.progress`,
    settings: `${STORAGE_PREFIX}.abacus.settings`,
  },
} as const;

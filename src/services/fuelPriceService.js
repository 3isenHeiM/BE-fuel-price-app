import axios from 'axios';

const LOCAL_HISTORY_FILE = '/data/heating-oil-history.json';
const STORAGE_KEY = 'belgian-heating-oil-history-v2';

const isBrowser = typeof window !== 'undefined';

const readStoredSnapshot = () => {
  if (!isBrowser) {
    return null;
  }

  try {
    const rawSnapshot = window.localStorage.getItem(STORAGE_KEY);
    return rawSnapshot ? JSON.parse(rawSnapshot) : null;
  } catch (error) {
    return null;
  }
};

const writeStoredSnapshot = (snapshot) => {
  if (!isBrowser) {
    return;
  }

  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot));
  } catch (error) {
    // Ignore storage quota / privacy mode failures.
  }
};

const withCacheStatus = (snapshot, cacheStatus, syncMessageKey, syncMessage) => ({
  ...snapshot,
  metadata: {
    ...snapshot.metadata,
    cacheStatus,
    syncMessageKey,
    syncMessage,
  },
});

export const fetchHeatingOilPriceData = async (options = {}) => {
  const { forceRefresh = false } = options;

  try {
    const response = await axios.get(LOCAL_HISTORY_FILE, {
      params: forceRefresh
        ? {
            _t: Date.now(),
          }
        : undefined,
      timeout: 10000,
      headers: {
        Accept: 'application/json',
      },
    });

    const nextSnapshot = withCacheStatus(
      response.data,
      'local-file',
      'localFileLoaded',
      'Loaded from the local history file in this project.',
    );

    writeStoredSnapshot(nextSnapshot);
    return nextSnapshot;
  } catch (error) {
    const storedSnapshot = readStoredSnapshot();

    if (storedSnapshot) {
      return withCacheStatus(
        storedSnapshot,
        'stale',
        'browserFallback',
        'The local JSON file could not be read, so the app fell back to the last browser copy.',
      );
    }

    const readError = new Error(
      'Unable to read the local heating oil history file. Run `npm run sync:history` to generate it.',
    );
    readError.code = 'localHistoryReadFailed';
    throw readError;
  }
};

export const fetchCurrentFuelPrices = async () => {
  const data = await fetchHeatingOilPriceData();
  return data.currentPrice;
};

export const fetchHistoricalFuelPrices = async () => {
  const data = await fetchHeatingOilPriceData();
  return data.historicalData;
};

export const getFuelTypeDisplayName = () => 'House Fuel';

export const getOfficialSources = () => ({
  local: {
    name: 'Local history snapshot',
    url: LOCAL_HISTORY_FILE,
    description: 'The full synchronized history stored inside this project.',
  },
  history: {
    name: 'Mazout.com history page',
    url: 'https://mazout.com/belgique/prix-mazout-de-chauffage',
    description: 'The Belgian heating oil history page used as the upstream source.',
  },
  api: {
    name: 'Mazout.com price-history API',
    url: 'https://api.carbu.com/mazout/v1/price-history',
    description: 'The upstream JSON feed used by the local sync script.',
  },
});

export const getHeatingOilInfo = () => ({
  description:
    'This app tracks the Belgian residential heating oil series published on mazout.com for “Mazout de chauffage extra - de 2 000 L”.',
  usage:
    'The latest published daily price is shown alongside the full historical curve, built from every synchronized point in the local dataset.',
  frequency:
    'The full history is stored locally in `public/data/heating-oil-history.json` and can be refreshed with `npm run sync:history`.',
});

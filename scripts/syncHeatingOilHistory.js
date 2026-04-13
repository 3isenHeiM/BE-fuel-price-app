const fs = require('fs/promises');
const path = require('path');
const https = require('https');
const axios = require('axios');

const API_BASE_URL = 'https://api.carbu.com/mazout/v1/';
const API_HISTORY_PATH = 'price-history';
const PUBLIC_API_KEY = 'elPb39PWhWJj9K2t73tlxyRL0cxEcTCr0cgceQ8q';
const HEATING_OIL_FUEL_ID = 6;
const DATA_FILE_PATH = path.join(__dirname, '..', 'public', 'data', 'heating-oil-history.json');

const SUMMARY_CONFIG = [
  {
    id: 'latest',
    label: 'Latest published price',
    caption: 'Current residential heating oil price',
    kind: 'price',
  },
  {
    id: 'week',
    label: '1 week change',
    caption: 'Difference versus one week ago',
    kind: 'delta',
  },
  {
    id: 'month',
    label: '1 month change',
    caption: 'Difference versus one month ago',
    kind: 'delta',
  },
  {
    id: 'year',
    label: '1 year change',
    caption: 'Difference versus one year ago',
    kind: 'delta',
  },
];

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 20000,
  httpsAgent: new https.Agent({
    rejectUnauthorized: false,
  }),
  headers: {
    Accept: 'application/json',
  },
});

const toIsoDate = (timestampMs) => new Date(timestampMs).toISOString().slice(0, 10);

const normalizeHistoryPoints = (rawPoints, sourceName) => {
  const mappedPoints = rawPoints
    .map(([timestampSeconds, rawPrice]) => ({
      timestamp: timestampSeconds * 1000,
      date: toIsoDate(timestampSeconds * 1000),
      price: Number(rawPrice),
      source: sourceName,
    }))
    .sort((left, right) => left.timestamp - right.timestamp);

  return mappedPoints.map((point, index) => {
    const previousPoint = mappedPoints[index - 1];
    const changeFromPrevious = previousPoint ? point.price - previousPoint.price : 0;
    const changePercentFromPrevious = previousPoint
      ? (changeFromPrevious / previousPoint.price) * 100
      : 0;

    return {
      ...point,
      changeFromPrevious,
      changePercentFromPrevious,
    };
  });
};

const normalizeSummary = (tableData) =>
  SUMMARY_CONFIG.map((config, index) => {
    const entry = tableData[index];

    if (!entry) {
      return null;
    }

    return {
      ...config,
      value: Number(entry.price),
      percentChange: Number(entry.percent ?? 0),
      decimals: Number(entry.decimals ?? 4),
      suffix: entry.suffix ?? '/L',
    };
  }).filter(Boolean);

const normalizeHeatingOilPayload = (payload) => {
  const historySource = payload?.data?.sources?.[0];
  const summarySource = payload?.data?.table?.[0];
  const rawHistoryPoints = historySource?.data ?? [];

  if (!rawHistoryPoints.length) {
    throw new Error('The mazout.com history feed returned no chart points.');
  }

  const historicalData = normalizeHistoryPoints(rawHistoryPoints, historySource.name);
  const currentPoint = historicalData[historicalData.length - 1];
  const previousPoint = historicalData[historicalData.length - 2] ?? null;
  const summary = normalizeSummary(summarySource?.data ?? []);
  const syncedAt = new Date().toISOString();

  return {
    currentPrice: {
      price: currentPoint.price,
      publishedAt: currentPoint.timestamp,
      publishedDate: currentPoint.date,
      previousPrice: previousPoint?.price ?? null,
      previousPublishedAt: previousPoint?.timestamp ?? null,
      previousPublishedDate: previousPoint?.date ?? null,
      changeFromPrevious: currentPoint.changeFromPrevious,
      changePercentFromPrevious: currentPoint.changePercentFromPrevious,
      seriesName: historySource.name,
      source: 'Local synchronized mazout.com history dataset',
      sourceUrl: 'https://mazout.com/belgique/prix-mazout-de-chauffage',
    },
    historicalData,
    summary,
    metadata: {
      syncedAt,
      totalPoints: historicalData.length,
      firstPublishedAt: historicalData[0].timestamp,
      lastPublishedAt: currentPoint.timestamp,
      seriesName: historySource.name,
      sourceName: 'mazout.com',
      sourceUrl: 'https://mazout.com/belgique/prix-mazout-de-chauffage',
      historyApiPath: `${API_BASE_URL}${API_HISTORY_PATH}`,
      fuelId: HEATING_OIL_FUEL_ID,
      cacheStatus: 'local-file',
      syncMessage: 'Loaded from the synchronized local history file.',
      localDatasetPath: '/data/heating-oil-history.json',
    },
  };
};

const syncHeatingOilHistory = async () => {
  const response = await apiClient.get(API_HISTORY_PATH, {
    params: {
      api_key: PUBLIC_API_KEY,
      fuelId: HEATING_OIL_FUEL_ID,
    },
  });

  const normalizedSnapshot = normalizeHeatingOilPayload(response.data);

  await fs.mkdir(path.dirname(DATA_FILE_PATH), { recursive: true });
  await fs.writeFile(DATA_FILE_PATH, JSON.stringify(normalizedSnapshot, null, 2));

  console.log(
    `Saved ${normalizedSnapshot.metadata.totalPoints} history points to ${DATA_FILE_PATH}`,
  );
};

syncHeatingOilHistory().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});

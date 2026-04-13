import { render, screen } from '@testing-library/react';
import App from './App';
import { fetchHeatingOilPriceData } from './services/fuelPriceService';

jest.mock('./components/FuelPriceChart', () => () => <div>History chart</div>);
jest.mock('./components/SeasonalityPanel', () => () => <div>Seasonality panel</div>);

jest.mock('./services/fuelPriceService', () => ({
  fetchHeatingOilPriceData: jest.fn(),
  getHeatingOilInfo: () => ({
    description: 'Heating oil description',
    usage: 'Heating oil usage',
    frequency: 'Stored in public/data/heating-oil-history.json.',
  }),
  getOfficialSources: () => ({
    local: {
      name: 'Local history snapshot',
      url: '/data/heating-oil-history.json',
    },
    history: {
      name: 'Mazout history',
      url: 'https://example.com/history',
    },
    api: {
      name: 'Mazout API',
      url: 'https://example.com/api',
    },
  }),
}));

test('renders the live price summary and history section', async () => {
  fetchHeatingOilPriceData.mockResolvedValue({
    currentPrice: {
      price: 1.4556,
      publishedAt: Date.UTC(2026, 3, 10),
      previousPrice: 1.317,
      previousPublishedAt: Date.UTC(2026, 3, 9),
      changeFromPrevious: 0.1386,
      changePercentFromPrevious: 10.52,
      seriesName: 'Mazout de chauffage extra - de 2 000 L',
    },
    summary: [
      { id: 'latest', label: 'Latest published price', value: 1.4556, caption: 'Current', kind: 'price' },
      { id: 'week', label: '1 week change', value: -0.1912, percentChange: -11.61, caption: 'Difference versus one week ago', kind: 'delta' },
    ],
    historicalData: [
      { timestamp: Date.UTC(2026, 3, 9), price: 1.317 },
      { timestamp: Date.UTC(2026, 3, 10), price: 1.4556 },
    ],
    metadata: {
      cacheStatus: 'local-file',
      totalPoints: 2,
      lastPublishedAt: Date.UTC(2026, 3, 10),
      firstPublishedAt: Date.UTC(2026, 3, 9),
      syncedAt: '2026-04-13T09:46:00.000Z',
      seriesName: 'Mazout de chauffage extra - de 2 000 L',
      historyApiPath: 'https://api.example.com/price-history',
      localDatasetPath: '/data/heating-oil-history.json',
    },
  });

  render(<App />);

  expect(await screen.findByText(/buy at the better moment/i)).toBeInTheDocument();
  expect(await screen.findAllByText(/1,4556 EUR\/L/i)).toHaveLength(2);
  expect(screen.getByText(/price history/i)).toBeInTheDocument();
  expect(screen.getByText(/jan-dec weekly comparison/i)).toBeInTheDocument();
  expect(screen.getByText(/history chart/i)).toBeInTheDocument();
  expect(screen.getByText(/seasonality panel/i)).toBeInTheDocument();
});

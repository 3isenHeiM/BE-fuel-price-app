import { fireEvent, render, screen } from '@testing-library/react';
import App from './App';
import { fetchHeatingOilPriceData } from './services/fuelPriceService';

jest.mock('./components/FuelPriceChart', () => ({ language, pricePrecision }) => (
  <div>{`History chart ${language} ${pricePrecision}`}</div>
));

jest.mock('./components/SeasonalityPanel', () => ({ language, pricePrecision }) => (
  <div>{`Seasonality panel ${language} ${pricePrecision}`}</div>
));

jest.mock('./services/fuelPriceService', () => ({
  fetchHeatingOilPriceData: jest.fn(),
}));

test('renders the dashboard in english by default and lets the user change language and price precision', async () => {
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
      {
        id: 'latest',
        label: 'Latest published price',
        value: 1.4556,
        caption: 'Current',
        kind: 'price',
      },
      {
        id: 'week',
        label: '1 week change',
        value: -0.1912,
        percentChange: -11.61,
        caption: 'Difference versus one week ago',
        kind: 'delta',
      },
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
      syncMessageKey: 'localFileLoaded',
    },
  });

  render(<App />);

  expect(await screen.findByText(/buy at the better moment/i)).toBeInTheDocument();
  expect(await screen.findAllByText('1.46 €/L')).toHaveLength(2);
  expect(screen.getByText('History chart en 2')).toBeInTheDocument();
  expect(screen.getByText('Seasonality panel en 2')).toBeInTheDocument();

  const languageSelect = screen.getByLabelText(/language/i);
  const precisionSelect = screen.getByLabelText(/price decimals/i);

  expect(languageSelect).toHaveValue('en');
  expect(precisionSelect).toHaveValue('2');

  fireEvent.change(languageSelect, { target: { value: 'fr' } });
  fireEvent.change(precisionSelect, { target: { value: '4' } });

  expect(await screen.findByText(/acheter au meilleur moment/i)).toBeInTheDocument();
  expect(await screen.findAllByText('1,4556 €/L')).toHaveLength(2);
  expect(screen.getByText('History chart fr 4')).toBeInTheDocument();
  expect(screen.getByText('Seasonality panel fr 4')).toBeInTheDocument();
});

import { render, screen } from '@testing-library/react';
import SeasonalityPanel from './SeasonalityPanel';

jest.mock('react-chartjs-2', () => ({
  Line: () => <div>Seasonality chart</div>,
}));

const buildPoint = (year, month, day, price) => ({
  timestamp: Date.UTC(year, month, day),
  price,
});

test('renders the delta between the latest price and the closest average week', () => {
  const historicalData = [
    buildPoint(2024, 0, 2, 0.5),
    buildPoint(2024, 0, 9, 0.6),
    buildPoint(2024, 0, 16, 0.7),
    buildPoint(2024, 0, 23, 0.8),
    buildPoint(2024, 0, 30, 0.9),
    buildPoint(2024, 1, 6, 1.0),
    buildPoint(2025, 0, 2, 0.7),
    buildPoint(2025, 0, 9, 0.8),
    buildPoint(2025, 0, 16, 0.9),
    buildPoint(2025, 0, 23, 1.0),
    buildPoint(2025, 0, 30, 1.1),
    buildPoint(2025, 1, 6, 1.2),
    buildPoint(2026, 0, 2, 0.9),
    buildPoint(2026, 0, 9, 1.0),
    buildPoint(2026, 0, 16, 1.1),
    buildPoint(2026, 0, 23, 1.2),
    buildPoint(2026, 0, 30, 1.3),
    buildPoint(2026, 1, 6, 1.4),
  ];

  render(<SeasonalityPanel historicalData={historicalData} />);

  expect(screen.getByText(/today vs average week/i)).toBeInTheDocument();
  expect(screen.getByText('+0,2000 EUR/L')).toBeInTheDocument();
  expect(screen.getByText(/\+16,67% against the closest average point/i)).toBeInTheDocument();
  expect(screen.getByText(/latest published price 1,4000 EUR\/L/i)).toBeInTheDocument();
});

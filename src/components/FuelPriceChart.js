import React, { useDeferredValue, useState } from 'react';
import { Line } from 'react-chartjs-2';
import {
  CategoryScale,
  Chart as ChartJS,
  Filler,
  Legend,
  LineElement,
  LinearScale,
  PointElement,
  Title,
  Tooltip,
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

const RANGE_OPTIONS = [
  { id: '1M', label: '1 month', days: 31 },
  { id: '6M', label: '6 months', days: 183 },
  { id: '1Y', label: '1 year', days: 366 },
  { id: 'ALL', label: 'All', days: null },
];

const axisDateFormatter = new Intl.DateTimeFormat('fr-BE', {
  day: '2-digit',
  month: '2-digit',
  year: '2-digit',
});

const tooltipDateFormatter = new Intl.DateTimeFormat('fr-BE', {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
});

const priceFormatter = new Intl.NumberFormat('fr-BE', {
  minimumFractionDigits: 4,
  maximumFractionDigits: 4,
});

const filterHistoryByRange = (historicalData, selectedRange) => {
  if (!historicalData.length || selectedRange === 'ALL') {
    return historicalData;
  }

  const selectedOption = RANGE_OPTIONS.find((option) => option.id === selectedRange);

  if (!selectedOption?.days) {
    return historicalData;
  }

  const latestTimestamp = historicalData[historicalData.length - 1].timestamp;
  const cutoffTimestamp = latestTimestamp - selectedOption.days * 24 * 60 * 60 * 1000;
  const filteredData = historicalData.filter((point) => point.timestamp >= cutoffTimestamp);

  return filteredData.length ? filteredData : historicalData;
};

const FuelPriceChart = ({ historicalData, isLoading, error, seriesName }) => {
  const [selectedRange, setSelectedRange] = useState('1Y');
  const deferredHistoricalData = useDeferredValue(historicalData);
  const filteredHistory = filterHistoryByRange(deferredHistoricalData, selectedRange);

  if (isLoading) {
    return (
      <div className="chart-state">
        <div className="spinner" />
        <p>Preparing the historical price chart...</p>
      </div>
    );
  }

  if (error && !historicalData.length) {
    return (
      <div className="chart-state chart-state-error">
        <p>{error.message}</p>
      </div>
    );
  }

  if (!filteredHistory.length) {
    return (
      <div className="chart-state">
        <p>No history points are available yet.</p>
      </div>
    );
  }

  const chartData = {
    labels: filteredHistory.map((point) => axisDateFormatter.format(new Date(point.timestamp))),
    datasets: [
      {
        label: seriesName,
        data: filteredHistory.map((point) => point.price),
        borderColor: '#0f766e',
        backgroundColor: 'rgba(15, 118, 110, 0.16)',
        fill: true,
        tension: 0.18,
        pointRadius: filteredHistory.length > 180 ? 0 : 2,
        pointHoverRadius: 4,
        borderWidth: 2.5,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      intersect: false,
      mode: 'index',
    },
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: false,
      },
      tooltip: {
        callbacks: {
          title: (tooltipItems) => {
            const point = filteredHistory[tooltipItems[0]?.dataIndex];
            return point ? tooltipDateFormatter.format(new Date(point.timestamp)) : '';
          },
          label: (context) => `${priceFormatter.format(context.parsed.y)} €/L`,
        },
      },
    },
    scales: {
      y: {
        beginAtZero: false,
        grid: {
          color: 'rgba(15, 23, 42, 0.08)',
        },
        ticks: {
          callback: (value) => `${priceFormatter.format(value)} €`,
        },
        title: {
          display: true,
          text: 'Price per liter',
        },
      },
      x: {
        grid: {
          display: false,
        },
        ticks: {
          autoSkip: true,
          maxTicksLimit: 8,
        },
      },
    },
  };

  return (
    <div className="chart-card">
      <div className="chart-toolbar">
        <div className="range-switcher" aria-label="History range">
          {RANGE_OPTIONS.map((option) => (
            <button
              aria-pressed={selectedRange === option.id}
              className={`range-chip ${selectedRange === option.id ? 'range-chip-active' : ''}`}
              key={option.id}
              onClick={() => setSelectedRange(option.id)}
              type="button"
            >
              {option.label}
            </button>
          ))}
        </div>

        <p className="chart-caption">
          Showing {filteredHistory.length} points from{' '}
          {tooltipDateFormatter.format(new Date(filteredHistory[0].timestamp))} to{' '}
          {tooltipDateFormatter.format(new Date(filteredHistory[filteredHistory.length - 1].timestamp))}
        </p>
      </div>

      <div className="chart-canvas">
        <Line data={chartData} options={chartOptions} />
      </div>
    </div>
  );
};

export default FuelPriceChart;

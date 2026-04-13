import React, { useDeferredValue } from 'react';
import { Line } from 'react-chartjs-2';
import {
  CategoryScale,
  Chart as ChartJS,
  Filler,
  Legend,
  LineElement,
  LinearScale,
  PointElement,
  Tooltip,
} from 'chart.js';
import { formatMessage, getLocale, getMessages } from '../i18n';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend, Filler);

const WEEKS_PER_YEAR = 53;
const BUYING_WINDOW_WEEKS = 6;
const REFERENCE_YEAR = 2025;
const MS_PER_DAY = 24 * 60 * 60 * 1000;

const average = (values) => values.reduce((sum, value) => sum + value, 0) / values.length;

const buildWeekBuckets = () => Array.from({ length: WEEKS_PER_YEAR }, () => []);

const getWeekBucketIndex = (timestamp) => {
  const date = new Date(timestamp);
  const startOfYear = Date.UTC(date.getUTCFullYear(), 0, 1);
  const dayIndex = Math.floor((timestamp - startOfYear) / MS_PER_DAY);
  return Math.min(WEEKS_PER_YEAR - 1, Math.floor(dayIndex / 7));
};

const getReferenceWeekStart = (weekIndex) => Date.UTC(REFERENCE_YEAR, 0, 1 + weekIndex * 7);

const getWeekDateLabel = (weekIndex, tooltipDateFormatter) =>
  tooltipDateFormatter.format(new Date(getReferenceWeekStart(weekIndex)));

const getWeekRangeLabel = (weekIndex, messages, tooltipDateFormatter) =>
  formatMessage(messages.seasonality.weekOf, {
    date: getWeekDateLabel(weekIndex, tooltipDateFormatter),
  });

const buildWeekAxisLabels = (locale, monthWidth) => {
  const labels = Array.from({ length: WEEKS_PER_YEAR }, () => '');
  const monthFirstBucketMap = new Map();
  const monthFormatter = new Intl.DateTimeFormat(locale, { month: monthWidth });

  for (let monthIndex = 0; monthIndex < 12; monthIndex += 1) {
    const monthStart = Date.UTC(REFERENCE_YEAR, monthIndex, 1);
    monthFirstBucketMap.set(
      Math.floor((monthStart - Date.UTC(REFERENCE_YEAR, 0, 1)) / (7 * MS_PER_DAY)),
      monthFormatter.format(new Date(monthStart)),
    );
  }

  monthFirstBucketMap.forEach((label, bucketIndex) => {
    if (bucketIndex >= 0 && bucketIndex < labels.length) {
      labels[bucketIndex] = label;
    }
  });

  return labels;
};

const formatEuroPerLiter = (priceFormatter, value) => `${priceFormatter.format(value)} €/L`;

const formatSignedEuroPerLiter = (priceFormatter, value) =>
  `${value > 0 ? '+' : ''}${priceFormatter.format(value)} €/L`;

const formatSignedPercent = (percentFormatter, value) =>
  `${value > 0 ? '+' : ''}${percentFormatter.format(value)}%`;

const getChangeTone = (value) => {
  if (value > 0) {
    return 'positive';
  }

  if (value < 0) {
    return 'negative';
  }

  return 'neutral';
};

const findClosestAverageWeek = (averageWeeklyTrend, targetWeekIndex) =>
  averageWeeklyTrend
    .map((value, index) => ({
      value,
      index,
      distance: Math.abs(index - targetWeekIndex),
    }))
    .filter((item) => item.value !== null)
    .sort((left, right) => left.distance - right.distance || left.index - right.index)[0] ?? null;

export const getSeasonalityModel = (historicalData) => {
  const yearBuckets = new Map();
  const allYearsByWeek = buildWeekBuckets();

  historicalData.forEach((point) => {
    const date = new Date(point.timestamp);
    const year = date.getUTCFullYear();
    const weekBucket = getWeekBucketIndex(point.timestamp);

    if (!yearBuckets.has(year)) {
      yearBuckets.set(year, buildWeekBuckets());
    }

    yearBuckets.get(year)[weekBucket].push(point.price);
    allYearsByWeek[weekBucket].push(point.price);
  });

  const years = Array.from(yearBuckets.keys()).sort((left, right) => left - right);
  const latestYear = years[years.length - 1];

  const datasets = years.map((year, index) => {
    const weeklyValues = yearBuckets.get(year).map((bucket) => (bucket.length ? average(bucket) : null));
    const hue = 176 + ((index * 27) % 140);
    const isLatestYear = year === latestYear;

    return {
      label: String(year),
      data: weeklyValues,
      borderColor: isLatestYear ? '#b45309' : `hsla(${hue}, 65%, 34%, 0.45)`,
      backgroundColor: 'transparent',
      borderWidth: isLatestYear ? 3.2 : 1.5,
      pointRadius: isLatestYear ? 1.8 : 0,
      pointHoverRadius: 4,
      tension: 0.18,
      spanGaps: true,
    };
  });

  const averageWeeklyTrend = allYearsByWeek.map((bucket) => (bucket.length ? average(bucket) : null));

  const validAverageWeeks = averageWeeklyTrend
    .map((value, index) => ({ value, index }))
    .filter((item) => item.value !== null);

  const bestWeek = validAverageWeeks.reduce((best, week) => (week.value < best.value ? week : best));
  const worstWeek = validAverageWeeks.reduce((worst, week) => (week.value > worst.value ? week : worst));

  const rollingWindows = [];

  for (let index = 0; index <= averageWeeklyTrend.length - BUYING_WINDOW_WEEKS; index += 1) {
    const windowValues = averageWeeklyTrend
      .slice(index, index + BUYING_WINDOW_WEEKS)
      .filter((value) => value !== null);

    if (windowValues.length === BUYING_WINDOW_WEEKS) {
      rollingWindows.push({
        startIndex: index,
        endIndex: index + BUYING_WINDOW_WEEKS - 1,
        value: average(windowValues),
      });
    }
  }

  const bestWindow = rollingWindows.reduce(
    (best, window) => (!best || window.value < best.value ? window : best),
    null,
  );

  const latestPoint = historicalData[historicalData.length - 1];
  const latestWeekIndex = getWeekBucketIndex(latestPoint.timestamp);
  const closestAverageWeek = findClosestAverageWeek(averageWeeklyTrend, latestWeekIndex);
  const latestDelta = closestAverageWeek ? latestPoint.price - closestAverageWeek.value : null;
  const latestDeltaPercent = closestAverageWeek?.value ? (latestDelta / closestAverageWeek.value) * 100 : 0;
  const latestVsAverage = closestAverageWeek
    ? {
        latestPoint,
        averagePrice: closestAverageWeek.value,
        averageWeekIndex: closestAverageWeek.index,
        distanceFromLatestWeek: closestAverageWeek.distance,
        delta: latestDelta,
        deltaPercent: latestDeltaPercent,
        tone: getChangeTone(latestDelta),
      }
    : null;

  return {
    averageWeeklyTrend,
    bestWeek,
    bestWindow,
    datasets,
    latestVsAverage,
    worstWeek,
    yearsCount: years.length,
  };
};

const SeasonalityPanel = ({
  historicalData,
  language = 'en',
  pricePrecision = 2,
}) => {
  const deferredHistoricalData = useDeferredValue(historicalData);

  if (!deferredHistoricalData.length) {
    return null;
  }

  const locale = getLocale(language);
  const messages = getMessages(language);
  const seasonalityModel = getSeasonalityModel(deferredHistoricalData);

  const priceFormatter = new Intl.NumberFormat(locale, {
    minimumFractionDigits: pricePrecision,
    maximumFractionDigits: pricePrecision,
  });

  const percentFormatter = new Intl.NumberFormat(locale, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  const integerFormatter = new Intl.NumberFormat(locale);

  const tooltipDateFormatter = new Intl.DateTimeFormat(locale, {
    day: '2-digit',
    month: 'short',
  });

  const publishedDateFormatter = new Intl.DateTimeFormat(locale, {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

  const chartData = {
    labels: buildWeekAxisLabels(locale, messages.seasonality.month),
    datasets: [
      {
        label: messages.seasonality.allYearsAverage,
        data: seasonalityModel.averageWeeklyTrend,
        borderColor: '#111827',
        backgroundColor: 'transparent',
        borderDash: [8, 6],
        borderWidth: 2.4,
        pointRadius: 0,
        pointHoverRadius: 4,
        tension: 0.12,
        spanGaps: true,
      },
      ...seasonalityModel.datasets,
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
        position: 'bottom',
        labels: {
          boxWidth: 18,
          boxHeight: 2,
          usePointStyle: false,
          padding: 16,
        },
      },
      tooltip: {
        callbacks: {
          title: (tooltipItems) =>
            getWeekRangeLabel(tooltipItems[0].dataIndex, messages, tooltipDateFormatter),
          label: (context) => {
            if (context.parsed.y === null) {
              return `${context.dataset.label}: ${messages.seasonality.noData}`;
            }

            return `${context.dataset.label}: ${priceFormatter.format(context.parsed.y)} €/L`;
          },
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
          text: messages.seasonality.yAxisTitle,
        },
      },
      x: {
        grid: {
          display: false,
        },
        ticks: {
          autoSkip: false,
          maxRotation: 0,
          callback(value, index) {
            return chartData.labels[index];
          },
        },
      },
    },
  };

  return (
    <div className="seasonality-panel">
      <div className="seasonality-insights">
        {seasonalityModel.latestVsAverage ? (
          <article
            className={`seasonality-insight seasonality-insight-${seasonalityModel.latestVsAverage.tone}`}
          >
            <span className="seasonality-label">{messages.seasonality.todayVsAverage}</span>
            <strong>
              {formatSignedEuroPerLiter(priceFormatter, seasonalityModel.latestVsAverage.delta)}
            </strong>
            <p>
              {formatMessage(messages.seasonality.latestVsAverage, {
                latestPrice: formatEuroPerLiter(
                  priceFormatter,
                  seasonalityModel.latestVsAverage.latestPoint.price,
                ),
                latestDate: publishedDateFormatter.format(
                  new Date(seasonalityModel.latestVsAverage.latestPoint.timestamp),
                ),
                averagePrice: formatEuroPerLiter(
                  priceFormatter,
                  seasonalityModel.latestVsAverage.averagePrice,
                ),
                weekLabel: getWeekDateLabel(
                  seasonalityModel.latestVsAverage.averageWeekIndex,
                  tooltipDateFormatter,
                ),
                nearestNote:
                  seasonalityModel.latestVsAverage.distanceFromLatestWeek > 0
                    ? messages.seasonality.nearestAverageNote
                    : '',
              })}
            </p>
            <p>
              {formatMessage(messages.seasonality.deltaVsAverage, {
                deltaPercent: formatSignedPercent(
                  percentFormatter,
                  seasonalityModel.latestVsAverage.deltaPercent,
                ),
              })}
            </p>
          </article>
        ) : null}

        <article className="seasonality-insight">
          <span className="seasonality-label">{messages.seasonality.bestWeek}</span>
          <strong>{getWeekDateLabel(seasonalityModel.bestWeek.index, tooltipDateFormatter)}</strong>
          <p>{messages.seasonality.bestWeekCaption}</p>
        </article>

        <article className="seasonality-insight">
          <span className="seasonality-label">{messages.seasonality.bestWindow}</span>
          <strong>
            {getWeekDateLabel(seasonalityModel.bestWindow.startIndex, tooltipDateFormatter)}{' '}
            {messages.seasonality.rangeSeparator}{' '}
            {getWeekDateLabel(seasonalityModel.bestWindow.endIndex, tooltipDateFormatter)}
          </strong>
          <p>{messages.seasonality.bestWindowCaption}</p>
        </article>

        <article className="seasonality-insight">
          <span className="seasonality-label">{messages.seasonality.worstWeek}</span>
          <strong>{getWeekDateLabel(seasonalityModel.worstWeek.index, tooltipDateFormatter)}</strong>
          <p>{messages.seasonality.worstWeekCaption}</p>
        </article>
      </div>

      <p className="seasonality-summary">{messages.seasonality.summary}</p>

      <div className="seasonality-chart-canvas">
        <Line data={chartData} options={chartOptions} />
      </div>

      <p className="chart-caption">
        {formatMessage(messages.seasonality.chartCaption, {
          yearsCount: integerFormatter.format(seasonalityModel.yearsCount),
          weeksCount: integerFormatter.format(WEEKS_PER_YEAR),
        })}
      </p>
    </div>
  );
};

export default SeasonalityPanel;

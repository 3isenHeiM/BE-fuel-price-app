import React, { startTransition, useEffect, useState } from 'react';
import './App.css';
import FuelPriceChart from './components/FuelPriceChart';
import SeasonalityPanel from './components/SeasonalityPanel';
import {
  fetchHeatingOilPriceData,
} from './services/fuelPriceService';

const priceFormatter = new Intl.NumberFormat('fr-BE', {
  minimumFractionDigits: 4,
  maximumFractionDigits: 4,
});

const percentFormatter = new Intl.NumberFormat('fr-BE', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const integerFormatter = new Intl.NumberFormat('fr-BE');

const dateFormatter = new Intl.DateTimeFormat('fr-BE', {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
});

const formatEuroPerLiter = (value) => `${priceFormatter.format(value)} €/L`;

const formatSignedEuroPerLiter = (value) =>
  `${value > 0 ? '+' : ''}${priceFormatter.format(value)} €/L`;

const formatSignedPercent = (value) => `${value > 0 ? '+' : ''}${percentFormatter.format(value)}%`;

const formatDate = (timestamp) => dateFormatter.format(new Date(timestamp));

const getChangeTone = (value) => {
  if (value > 0) {
    return 'positive';
  }

  if (value < 0) {
    return 'negative';
  }

  return 'neutral';
};

const getStorageBadgeLabel = (cacheStatus) => {
  switch (cacheStatus) {
    case 'local-file':
      return 'Local file';
    case 'stale':
      return 'Browser fallback';
    default:
      return 'Loading';
  }
};

function App() {
  const [dashboardData, setDashboardData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const loadDashboardData = async (forceRefresh = false) => {
    try {
      setError(null);

      if (forceRefresh) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }

      const nextDashboardData = await fetchHeatingOilPriceData({ forceRefresh });

      startTransition(() => {
        setDashboardData(nextDashboardData);
      });
    } catch (loadError) {
      setError(loadError);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const currentPrice = dashboardData?.currentPrice;
  const summary = dashboardData?.summary ?? [];
  const metadata = dashboardData?.metadata;
  const staleWarning = metadata?.cacheStatus === 'stale' ? metadata.syncMessage : null;
  const currentPriceTone = getChangeTone(currentPrice?.changeFromPrevious ?? 0);

  return (
    <div className="App">
      <div className="app-shell">
        <header className="hero">
          <div className="hero-copy">
            <span className="eyebrow">Belgian heating oil tracker</span>
            <h1>Buy at the better moment.</h1>
            <p className="hero-text">
              Daily price, full history, and a weekly seasonal comparison to help time your next
              order.
            </p>

            <div className="hero-meta">
              <span className={`badge badge-${metadata?.cacheStatus ?? 'loading'}`}>
                {getStorageBadgeLabel(metadata?.cacheStatus)}
              </span>
              {metadata?.totalPoints ? (
                <span className="badge">
                  {integerFormatter.format(metadata.totalPoints)} stored points
                </span>
              ) : null}
              {metadata?.lastPublishedAt ? (
                <span className="badge">Latest publication {formatDate(metadata.lastPublishedAt)}</span>
              ) : null}
            </div>

            <div className="hero-actions">
              <button
                className="primary-button"
                disabled={isLoading || isRefreshing}
                onClick={() => loadDashboardData(true)}
                type="button"
              >
                {isRefreshing ? 'Reloading local history...' : 'Reload local history'}
              </button>
            </div>
          </div>

          <section className="surface-card hero-panel">
            {isLoading && !dashboardData ? (
              <div className="loading-state">
                <div className="spinner" />
                <p>Loading local history...</p>
              </div>
            ) : null}

            {currentPrice ? (
              <div className="price-spotlight">
                <span className="panel-label">Latest published price</span>
                <strong className="spotlight-value">{formatEuroPerLiter(currentPrice.price)}</strong>
                <p className="spotlight-date">Published on {formatDate(currentPrice.publishedAt)}</p>

                <div className={`movement movement-${currentPriceTone}`}>
                  <span className="movement-label">Move from previous publication</span>
                  <strong>{formatSignedEuroPerLiter(currentPrice.changeFromPrevious)}</strong>
                  <span>{formatSignedPercent(currentPrice.changePercentFromPrevious)}</span>
                </div>

                {currentPrice.previousPublishedAt ? (
                  <p className="spotlight-footnote">
                    Previous point: {formatEuroPerLiter(currentPrice.previousPrice)} on{' '}
                    {formatDate(currentPrice.previousPublishedAt)}
                  </p>
                ) : null}
              </div>
            ) : null}

            {!isLoading && !currentPrice && error ? (
              <div className="error-state">
                <strong>Unable to load price data</strong>
                <p>{error.message}</p>
              </div>
            ) : null}
          </section>
        </header>

        {staleWarning ? (
          <div className="notice-banner notice-banner-warning">{staleWarning}</div>
        ) : null}

        {error && !dashboardData ? (
          <div className="notice-banner notice-banner-error">{error.message}</div>
        ) : null}

        {dashboardData ? (
          <>
            <section className="summary-grid">
              {summary.map((item) => (
                <article
                  className={`surface-card summary-card summary-card-${
                    item.kind === 'delta' ? getChangeTone(item.value) : 'neutral'
                  }`}
                  key={item.id}
                >
                  <span className="summary-label">{item.label}</span>
                  <strong className="summary-value">
                    {item.kind === 'price'
                      ? formatEuroPerLiter(item.value)
                      : formatSignedEuroPerLiter(item.value)}
                  </strong>
                  <span className="summary-caption">
                    {item.kind === 'price'
                      ? item.caption
                      : `${formatSignedPercent(item.percentChange)} ${item.caption.toLowerCase()}`}
                  </span>
                </article>
              ))}
            </section>

            <section className="surface-card section-card">
              <div className="section-head">
                <div>
                  <span className="section-kicker">History</span>
                  <h2>Price history</h2>
                  <p>
                    {formatDate(metadata.firstPublishedAt)} to {formatDate(metadata.lastPublishedAt)}
                  </p>
                </div>
              </div>

              <FuelPriceChart
                historicalData={dashboardData.historicalData}
                isLoading={isLoading && !dashboardData}
                error={error && !dashboardData ? error : null}
                seriesName={metadata.seriesName}
              />
            </section>

            <section className="surface-card section-card">
              <div className="section-head">
                <div>
                  <span className="section-kicker">Seasonality</span>
                  <h2>Jan-Dec weekly comparison</h2>
                  <p>
                    One line per year, grouped by week.
                  </p>
                </div>
              </div>

              <SeasonalityPanel historicalData={dashboardData.historicalData} />
            </section>
          </>
        ) : null}
      </div>
    </div>
  );
}

export default App;

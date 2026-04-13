import React, { startTransition, useEffect, useState } from 'react';
import './App.css';
import FuelPriceChart from './components/FuelPriceChart';
import SeasonalityPanel from './components/SeasonalityPanel';
import { fetchHeatingOilPriceData } from './services/fuelPriceService';
import {
  DEFAULT_LANGUAGE,
  DEFAULT_PRICE_PRECISION,
  formatMessage,
  getLocale,
  getMessages,
  LANGUAGE_OPTIONS,
  PRICE_PRECISION_OPTIONS,
} from './i18n';

const LANGUAGE_STORAGE_KEY = 'fuel-price-language';

const isBrowser = typeof window !== 'undefined';

const clampPricePrecision = (value) => {
  if (value === null || value === undefined || value === '') {
    return DEFAULT_PRICE_PRECISION;
  }

  const parsedValue = Number(value);

  if (Number.isNaN(parsedValue)) {
    return DEFAULT_PRICE_PRECISION;
  }

  return Math.min(4, Math.max(0, parsedValue));
};

const readStoredLanguage = () => {
  if (!isBrowser) {
    return DEFAULT_LANGUAGE;
  }

  try {
    const storedLanguage = window.localStorage.getItem(LANGUAGE_STORAGE_KEY);
    return LANGUAGE_OPTIONS.some((option) => option.value === storedLanguage)
      ? storedLanguage
      : DEFAULT_LANGUAGE;
  } catch (error) {
    return DEFAULT_LANGUAGE;
  }
};

const getChangeTone = (value) => {
  if (value > 0) {
    return 'positive';
  }

  if (value < 0) {
    return 'negative';
  }

  return 'neutral';
};

const getSummaryCopy = (item, messages) => messages.summary[item.id] ?? {
  label: item.label,
  caption: item.caption,
};

const getTranslatedSyncMessage = (metadata, messages) =>
  messages.syncMessages[metadata?.syncMessageKey] ?? metadata?.syncMessage ?? null;

const getTranslatedErrorMessage = (error, messages) =>
  messages.errors[error?.code] ?? error?.message ?? '';

function App() {
  const [dashboardData, setDashboardData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [language, setLanguage] = useState(readStoredLanguage);
  const [pricePrecision, setPricePrecision] = useState(DEFAULT_PRICE_PRECISION);

  const messages = getMessages(language);
  const locale = getLocale(language);

  const priceFormatter = new Intl.NumberFormat(locale, {
    minimumFractionDigits: pricePrecision,
    maximumFractionDigits: pricePrecision,
  });

  const percentFormatter = new Intl.NumberFormat(locale, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  const dateFormatter = new Intl.DateTimeFormat(locale, {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

  const formatEuroPerLiter = (value) => `${priceFormatter.format(value)} €/L`;

  const formatSignedEuroPerLiter = (value) =>
    `${value > 0 ? '+' : ''}${priceFormatter.format(value)} €/L`;

  const formatSignedPercent = (value) =>
    `${value > 0 ? '+' : ''}${percentFormatter.format(value)}%`;

  const formatDate = (timestamp) => dateFormatter.format(new Date(timestamp));

  useEffect(() => {
    if (!isBrowser) {
      return;
    }

    window.localStorage.setItem(LANGUAGE_STORAGE_KEY, language);
    document.documentElement.lang = language;
  }, [language]);

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
  const staleWarning =
    metadata?.cacheStatus === 'stale' ? getTranslatedSyncMessage(metadata, messages) : null;
  const translatedErrorMessage = error ? getTranslatedErrorMessage(error, messages) : '';
  const currentPriceTone = getChangeTone(currentPrice?.changeFromPrevious ?? 0);

  return (
    <div className="App">
      <div className="app-shell">
        <header className="hero">
          <div className="hero-copy">
            <span className="eyebrow">{messages.hero.eyebrow}</span>
            <h1>{messages.hero.title}</h1>
            <p className="hero-text">{messages.hero.text}</p>

            <div className="hero-meta">
              {metadata?.lastPublishedAt ? (
                <span className="badge">
                  {formatMessage(messages.hero.latestPublication, {
                    date: formatDate(metadata.lastPublishedAt),
                  })}
                </span>
              ) : null}
            </div>

            <div className="hero-actions">
              <button
                className="primary-button"
                disabled={isLoading || isRefreshing}
                onClick={() => loadDashboardData(true)}
                type="button"
              >
                {isRefreshing ? messages.hero.reloading : messages.hero.reload}
              </button>
            </div>
          </div>

          <div className="hero-side">
            <div className="hero-controls hero-controls-panel" aria-label={messages.controls.preferences}>
              <label className="control-field">
                <span className="control-label">{messages.controls.language}</span>
                <select
                  className="control-select"
                  onChange={(event) => setLanguage(event.target.value)}
                  value={language}
                >
                  {LANGUAGE_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>

              <label className="control-field">
                <span className="control-label">{messages.controls.pricePrecision}</span>
                <select
                  className="control-select"
                  onChange={(event) => setPricePrecision(clampPricePrecision(event.target.value))}
                  value={pricePrecision}
                >
                  {PRICE_PRECISION_OPTIONS.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <section className="surface-card hero-panel">
              {isLoading && !dashboardData ? (
                <div className="loading-state">
                  <div className="spinner" />
                  <p>{messages.hero.loading}</p>
                </div>
              ) : null}

              {currentPrice ? (
                <div className="price-spotlight">
                  <span className="panel-label">{messages.priceSpotlight.label}</span>
                  <strong className="spotlight-value">{formatEuroPerLiter(currentPrice.price)}</strong>
                  <p className="spotlight-date">
                    {formatMessage(messages.priceSpotlight.publishedOn, {
                      date: formatDate(currentPrice.publishedAt),
                    })}
                  </p>

                  <div className={`movement movement-${currentPriceTone}`}>
                    <span className="movement-label">{messages.priceSpotlight.moveFromPrevious}</span>
                    <strong>{formatSignedEuroPerLiter(currentPrice.changeFromPrevious)}</strong>
                    <span>{formatSignedPercent(currentPrice.changePercentFromPrevious)}</span>
                  </div>

                  {currentPrice.previousPublishedAt ? (
                    <p className="spotlight-footnote">
                      {formatMessage(messages.priceSpotlight.previousPoint, {
                        price: formatEuroPerLiter(currentPrice.previousPrice),
                        date: formatDate(currentPrice.previousPublishedAt),
                      })}
                    </p>
                  ) : null}
                </div>
              ) : null}

              {!isLoading && !currentPrice && error ? (
                <div className="error-state">
                  <strong>{messages.states.loadErrorTitle}</strong>
                  <p>{translatedErrorMessage}</p>
                </div>
              ) : null}
            </section>
          </div>
        </header>

        {staleWarning ? (
          <div className="notice-banner notice-banner-warning">{staleWarning}</div>
        ) : null}

        {error && !dashboardData ? (
          <div className="notice-banner notice-banner-error">{translatedErrorMessage}</div>
        ) : null}

        {dashboardData ? (
          <>
            <section className="summary-grid">
              {summary.map((item) => {
                const summaryCopy = getSummaryCopy(item, messages);

                return (
                  <article
                    className={`surface-card summary-card summary-card-${
                      item.kind === 'delta' ? getChangeTone(item.value) : 'neutral'
                    }`}
                    key={item.id}
                  >
                    <span className="summary-label">{summaryCopy.label}</span>
                    <strong className="summary-value">
                      {item.kind === 'price'
                        ? formatEuroPerLiter(item.value)
                        : formatSignedEuroPerLiter(item.value)}
                    </strong>
                    <span className="summary-caption">
                      {item.kind === 'price'
                        ? summaryCopy.caption
                        : `${formatSignedPercent(item.percentChange)} ${summaryCopy.caption}`}
                    </span>
                  </article>
                );
              })}
            </section>

            <section className="surface-card section-card">
              <div className="section-head">
                <div>
                  <span className="section-kicker">{messages.sections.historyKicker}</span>
                  <h2>{messages.sections.historyTitle}</h2>
                  <p>
                    {formatMessage(messages.sections.historySubtitle, {
                      from: formatDate(metadata.firstPublishedAt),
                      to: formatDate(metadata.lastPublishedAt),
                    })}
                  </p>
                </div>
              </div>

              <FuelPriceChart
                error={error && !dashboardData ? error : null}
                historicalData={dashboardData.historicalData}
                isLoading={isLoading && !dashboardData}
                language={language}
                pricePrecision={pricePrecision}
                seriesName={metadata.seriesName}
              />
            </section>

            <section className="surface-card section-card">
              <div className="section-head">
                <div>
                  <span className="section-kicker">{messages.sections.seasonalityKicker}</span>
                  <h2>{messages.sections.seasonalityTitle}</h2>
                  <p>{messages.sections.seasonalitySubtitle}</p>
                </div>
              </div>

              <SeasonalityPanel
                historicalData={dashboardData.historicalData}
                language={language}
                pricePrecision={pricePrecision}
              />
            </section>
          </>
        ) : null}
      </div>
    </div>
  );
}

export default App;

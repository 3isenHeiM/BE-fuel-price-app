export const DEFAULT_LANGUAGE = 'en';
export const DEFAULT_PRICE_PRECISION = 2;

export const LANGUAGE_OPTIONS = [
  { value: 'fr', label: 'FR' },
  { value: 'nl', label: 'NL' },
  { value: 'en', label: 'EN' },
];

export const PRICE_PRECISION_OPTIONS = [0, 1, 2, 3, 4];

const LOCALE_BY_LANGUAGE = {
  fr: 'fr-BE',
  nl: 'nl-BE',
  en: 'en-GB',
};

export const getLocale = (language) => LOCALE_BY_LANGUAGE[language] ?? LOCALE_BY_LANGUAGE.en;

export const formatMessage = (template, values = {}) =>
  Object.entries(values).reduce(
    (result, [key, value]) => result.replaceAll(`{${key}}`, String(value)),
    template,
  );

const messages = {
  en: {
    controls: {
      preferences: 'Display preferences',
      language: 'Language',
      pricePrecision: 'Price decimals',
    },
    hero: {
      eyebrow: 'Belgian heating oil tracker',
      title: 'Buy at the better moment.',
      text: 'Daily price, full history, and a weekly seasonal comparison to help time your next order.',
      storedPoints: '{count} stored points',
      latestPublication: 'Latest publication {date}',
      reload: 'Reload local history',
      reloading: 'Reloading local history...',
      loading: 'Loading local history...',
    },
    storageBadge: {
      'local-file': 'Local file',
      stale: 'Browser fallback',
      loading: 'Loading',
    },
    priceSpotlight: {
      label: 'Latest published price',
      publishedOn: 'Published on {date}',
      moveFromPrevious: 'Move from previous publication',
      previousPoint: 'Previous point: {price} on {date}',
    },
    summary: {
      latest: {
        label: 'Latest published price',
        caption: 'Current residential heating oil price',
      },
      week: {
        label: '1 week change',
        caption: 'Difference versus one week ago',
      },
      month: {
        label: '1 month change',
        caption: 'Difference versus one month ago',
      },
      year: {
        label: '1 year change',
        caption: 'Difference versus one year ago',
      },
    },
    sections: {
      historyKicker: 'History',
      historyTitle: 'Price history',
      historySubtitle: '{from} to {to}',
      seasonalityKicker: 'Seasonality',
      seasonalityTitle: 'Jan-Dec weekly comparison',
      seasonalitySubtitle: 'One line per year, grouped by week.',
    },
    states: {
      loadErrorTitle: 'Unable to load price data',
    },
    chart: {
      ranges: {
        '1M': '1 month',
        '6M': '6 months',
        '1Y': '1 year',
        ALL: 'All',
      },
      historyRange: 'History range',
      preparing: 'Preparing the historical price chart...',
      empty: 'No history points are available yet.',
      yAxisTitle: 'Price per liter',
      showingRange: 'Showing {count} points from {from} to {to}',
    },
    seasonality: {
      month: 'short',
      weekOf: 'Week of {date}',
      allYearsAverage: 'All-years average',
      noData: 'no data',
      yAxisTitle: 'Average weekly price per liter',
      todayVsAverage: 'Today vs average week',
      nearestAverageNote: ' (nearest available average bucket)',
      latestVsAverage:
        'Latest published price {latestPrice} on {latestDate} versus the all-years weekly average of {averagePrice} for {weekLabel}{nearestNote}.',
      deltaVsAverage: '{deltaPercent} against the closest average point in the seasonal curve.',
      bestWeek: 'Best week historically',
      bestWeekCaption: 'Lowest all-years weekly average for house fuel.',
      bestWindow: 'Best buying window',
      rangeSeparator: 'to',
      bestWindowCaption: 'Softest six-week historical average across all stored years.',
      worstWeek: 'Most expensive week',
      worstWeekCaption: 'Highest all-years weekly average in the local history.',
      summary:
        'Each colored line is one calendar year, averaged by week from January to December. This gives a more granular seasonal view of when house fuel tends to be cheaper during the year.',
      chartCaption:
        'Comparing {yearsCount} years across {weeksCount} week buckets. The dashed line is the all-years weekly average.',
    },
    syncMessages: {
      localFileLoaded: 'Loaded from the local history file in this project.',
      browserFallback:
        'The local JSON file could not be read, so the app fell back to the last browser copy.',
    },
    errors: {
      localHistoryReadFailed:
        'Unable to read the local heating oil history file. Run `npm run sync:history` to generate it.',
    },
  },
  fr: {
    controls: {
      preferences: 'Preferences d affichage',
      language: 'Langue',
      pricePrecision: 'Decimales du prix',
    },
    hero: {
      eyebrow: 'Suivi du mazout en Belgique',
      title: 'Acheter au meilleur moment.',
      text: 'Prix du jour, historique complet et comparaison saisonnière hebdomadaire pour mieux planifier votre prochaine commande.',
      storedPoints: '{count} points enregistres',
      latestPublication: 'Dernière publication {date}',
      reload: "Recharger l'historique local",
      reloading: "Rechargement de l'historique local...",
      loading: "Chargement de l'historique local...",
    },
    storageBadge: {
      'local-file': 'Fichier local',
      stale: 'Copie du navigateur',
      loading: 'Chargement',
    },
    priceSpotlight: {
      label: 'Dernier prix publie',
      publishedOn: 'Publiè le {date}',
      moveFromPrevious: 'Evolution depuis la publication précédente',
      previousPoint: 'Point précédent : {price} le {date}',
    },
    summary: {
      latest: {
        label: 'Dernier prix publié',
        caption: 'Prix actuel du mazout domestique',
      },
      week: {
        label: 'Evolution sur 1 semaine',
        caption: 'Différence par rapport à il y a une semaine',
      },
      month: {
        label: 'Evolution sur 1 mois',
        caption: 'Différence par rapport à il y a un mois',
      },
      year: {
        label: 'Evolution sur 1 an',
        caption: 'Différence par rapport à il y a un an',
      },
    },
    sections: {
      historyKicker: 'Historique',
      historyTitle: 'Historique des prix',
      historySubtitle: 'Du {from} au {to}',
      seasonalityKicker: 'Saisonnalite',
      seasonalityTitle: 'Comparaison hebdomadaire janv.-dec.',
      seasonalitySubtitle: 'Une ligne par année, regroupée par semaine.',
    },
    states: {
      loadErrorTitle: 'Impossible de charger les prix',
    },
    chart: {
      ranges: {
        '1M': '1 mois',
        '6M': '6 mois',
        '1Y': '1 an',
        ALL: 'Tout',
      },
      historyRange: "Période de l'historique",
      preparing: 'Préparation du graphique historique...',
      empty: "Aucun point d'historique disponible pour le moment.",
      yAxisTitle: 'Prix au litre',
      showingRange: '{count} points affichés du {from} au {to}',
    },
    seasonality: {
      month: 'short',
      weekOf: 'Semaine du {date}',
      allYearsAverage: 'Moyenne toutes années',
      noData: 'pas de données',
      yAxisTitle: 'Prix hebdomadaire moyen par litre',
      todayVsAverage: "Aujourd'hui vs moyenne",
      nearestAverageNote: ' (bucket moyen disponible le plus proche)',
      latestVsAverage:
        'Le dernier prix publié {latestPrice} le {latestDate} est comparé à la moyenne hebdomadaire toutes années de {averagePrice} pour la semaine du {weekLabel}{nearestNote}.',
      deltaVsAverage: '{deltaPercent} par rapport au point moyen le plus proche de la courbe saisonnière.',
      bestWeek: 'Meilleure semaine historique',
      bestWeekCaption: 'La moyenne hebdomadaire toutes années la plus basse pour le mazout.',
      bestWindow: 'Meilleure fenêtre d\'achat',
      rangeSeparator: 'a',
      bestWindowCaption: 'La moyenne historique la plus douce sur six semaines dans les données locales.',
      worstWeek: 'Semaine la plus chere',
      worstWeekCaption: 'La moyenne hebdomadaire toutes années la plus elevee dans l\'historique local.',
      summary:
        'Chaque ligne colorée represente une année civile, moyennée par semaine de janvier à decembre. Cela donne une vue saisonnière plus fine des moments où le mazout a tendance à être moins cher.',
      chartCaption:
        'Comparaison de {yearsCount} années sur {weeksCount} buckets hebdomadaires. La ligne en pointilles represente la moyenne toutes années.',
    },
    syncMessages: {
      localFileLoaded: 'Charge depuis le fichier historique local du projet.',
      browserFallback:
        'Le fichier JSON local est indisponible, la derniere copie du navigateur a donc ete utilisée.',
    },
    errors: {
      localHistoryReadFailed:
        'Impossible de lire le fichier local de l\'historique du mazout. Lancez `npm run sync:history` pour le generer.',
    },
  },
  nl: {
    controls: {
      preferences: 'Weergavevoorkeuren',
      language: 'Taal',
      pricePrecision: 'Prijsdecimalen',
    },
    hero: {
      eyebrow: 'Belgische stookolie tracker',
      title: 'Kopen op het betere moment.',
      text: 'Dagprijs, volledige historiek en een wekelijkse seizoensvergelijking om je volgende bestelling beter te timen.',
      storedPoints: '{count} opgeslagen punten',
      latestPublication: 'Laatste publicatie {date}',
      reload: 'Lokale historiek herladen',
      reloading: 'Lokale historiek wordt herladen...',
      loading: 'Lokale historiek wordt geladen...',
    },
    storageBadge: {
      'local-file': 'Lokaal bestand',
      stale: 'Browserkopie',
      loading: 'Laden',
    },
    priceSpotlight: {
      label: 'Laatst gepubliceerde prijs',
      publishedOn: 'Gepubliceerd op {date}',
      moveFromPrevious: 'Verschil met de vorige publicatie',
      previousPoint: 'Vorige punt: {price} op {date}',
    },
    summary: {
      latest: {
        label: 'Laatst gepubliceerde prijs',
        caption: 'Huidige prijs voor huishoudelijke stookolie',
      },
      week: {
        label: 'Verandering over 1 week',
        caption: 'Verschil tegenover een week geleden',
      },
      month: {
        label: 'Verandering over 1 maand',
        caption: 'Verschil tegenover een maand geleden',
      },
      year: {
        label: 'Verandering over 1 jaar',
        caption: 'Verschil tegenover een jaar geleden',
      },
    },
    sections: {
      historyKicker: 'Historiek',
      historyTitle: 'Prijshistoriek',
      historySubtitle: 'Van {from} tot {to}',
      seasonalityKicker: 'Seizoenspatroon',
      seasonalityTitle: 'Wekelijkse vergelijking jan-dec',
      seasonalitySubtitle: 'Een lijn per jaar, gegroepeerd per week.',
    },
    states: {
      loadErrorTitle: 'Prijsgegevens konden niet worden geladen',
    },
    chart: {
      ranges: {
        '1M': '1 maand',
        '6M': '6 maanden',
        '1Y': '1 jaar',
        ALL: 'Alles',
      },
      historyRange: 'Historiekbereik',
      preparing: 'Historische grafiek wordt voorbereid...',
      empty: 'Er zijn nog geen historische punten beschikbaar.',
      yAxisTitle: 'Prijs per liter',
      showingRange: '{count} punten van {from} tot {to}',
    },
    seasonality: {
      month: 'short',
      weekOf: 'Week van {date}',
      allYearsAverage: 'Gemiddelde over alle jaren',
      noData: 'geen data',
      yAxisTitle: 'Gemiddelde wekelijkse prijs per liter',
      todayVsAverage: 'Vandaag vs gemiddelde week',
      nearestAverageNote: ' (dichtstbijzijnde beschikbare gemiddelde bucket)',
      latestVsAverage:
        'De laatst gepubliceerde prijs van {latestPrice} op {latestDate} wordt vergeleken met het gemiddelde over alle jaren van {averagePrice} voor {weekLabel}{nearestNote}.',
      deltaVsAverage: '{deltaPercent} tegenover het dichtstbijzijnde gemiddelde punt in de seizoenscurve.',
      bestWeek: 'Historisch beste week',
      bestWeekCaption: 'Laagste gemiddelde weekprijs over alle jaren voor stookolie.',
      bestWindow: 'Beste aankoopvenster',
      rangeSeparator: 'tot',
      bestWindowCaption: 'Zachtste historische zesweekse gemiddelde in alle lokale jaren.',
      worstWeek: 'Duurste week',
      worstWeekCaption: 'Hoogste gemiddelde weekprijs over alle jaren in de lokale historiek.',
      summary:
        'Elke gekleurde lijn is een kalenderjaar, gemiddeld per week van januari tot december. Zo zie je nauwkeuriger in welke periodes stookolie historisch goedkoper is.',
      chartCaption:
        'Vergelijking van {yearsCount} jaren over {weeksCount} weekbuckets. De stippellijn is het gemiddelde over alle jaren.',
    },
    syncMessages: {
      localFileLoaded: 'Geladen uit het lokale historiekbestand in dit project.',
      browserFallback:
        'Het lokale JSON-bestand kon niet worden gelezen, daarom werd de laatste browserkopie gebruikt.',
    },
    errors: {
      localHistoryReadFailed:
        'Het lokale bestand met stookoliehistoriek kon niet worden gelezen. Voer `npm run sync:history` uit om het te genereren.',
    },
  },
};

export const getMessages = (language) => messages[language] ?? messages.en;

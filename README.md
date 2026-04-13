# Belgian Fuel Prices Tracker

A React web application that tracks and displays **official** fuel prices in Belgium, including house fuel (heating oil) prices from government sources.

## 🎯 Features

- **Official Belgian Data**: Connects to official government APIs for real fuel price data
- **House Fuel Tracking**: Focus on heating oil prices as requested
- **Historical Trends**: Interactive charts showing price evolution over time
- **Multiple Fuel Types**: Track prices for heating oil, gasoline (95 and 98), diesel, and LPG
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile devices
- **Robust Error Handling**: Graceful fallbacks when official APIs are unavailable
- **Real-time Updates**: Current prices with timestamps

## 📊 Data Sources

This application connects to official Belgian government sources:

### Primary Sources:
1. **SPF Economie** - Belgian Federal Public Service for Economy
   - Official fuel price database
   - Current and historical pricing data

2. **Vlaamse Overheid** - Government of Flanders
   - Regional fuel price monitoring
   - Comprehensive fuel type coverage

### Fallback Mechanism:
When official APIs are unavailable, the app provides estimated data based on:
- Recent price trends
- Seasonal patterns
- Market indicators

This ensures users always have access to price information, even during API outages.

## 🚀 Installation

### Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)
- Internet connection (for fetching official data)

### Setup

1. Clone this repository:
   ```bash
   git clone https://github.com/your-repo/fuel-price-tracker.git
   cd fuel-price-tracker
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm start
   ```

4. Open your browser and navigate to `http://localhost:3000`

## 🛠️ Running in Production

To create a production build:

```bash
npm run build
```

The optimized production files will be created in the `build` folder.

## 🌐 GitHub Pages Deployment

This project is configured for GitHub Pages at:

`https://3isenHeiM.github.io/BE-fuel-price-app`

The workflow file [`.github/workflows/deploy-pages.yml`](./.github/workflows/deploy-pages.yml):

- deploys automatically on each push to `main`
- can be launched manually from the Actions tab
- runs every day at `12:15 UTC` to refresh the heating-oil history and redeploy the site

Schedule note:

- `12:15 UTC` corresponds to `13:15` in Belgium during winter time and `14:15` during summer time
- this gives the workflow more margin to catch the latest official daily publication before rebuilding the site

To enable it on GitHub:

1. Push the repository to GitHub.
2. In GitHub, open `Settings` -> `Pages`.
3. Set `Source` to `GitHub Actions`.
4. Let the first workflow run complete.

Important note:

- GitHub Pages is static hosting, so the website itself does not run a server 24/7.
- The daily refresh happens through GitHub Actions, which rebuilds the site with the latest synchronized JSON data.

## ⏰ Daily Server Sync

React itself does not run scheduled jobs on the server. The frontend only reads the local JSON file.
If you want the server to poll once per day and update the history file automatically, run the
server-side scheduler:

```bash
npm run sync:history:daily
```

This starts a small Node process that:

- optionally syncs immediately on startup
- refreshes `public/data/heating-oil-history.json` every day
- keeps the website reading the updated local file

Optional environment variables:

```bash
HISTORY_SYNC_HOUR=6
HISTORY_SYNC_MINUTE=15
HISTORY_SYNC_IMMEDIATE=true
```

Example with a server process manager:

```bash
HISTORY_SYNC_HOUR=6 HISTORY_SYNC_MINUTE=15 npm run sync:history:daily
```

If you prefer classic server cron instead of a long-running Node process, you can also schedule:

```bash
npm run sync:history
```

## 📁 File Structure

```
src/
├── components/
│   └── FuelPriceChart.js  # Interactive chart component
├── services/
│   └── fuelPriceService.js  # Official data fetching service
├── App.js                  # Main application component
├── App.css                 # Global styles and animations
└── index.js                # Application entry point
```

## 🔧 Technical Details

### API Integration

The `fuelPriceService.js` handles:
- Connection to official Belgian fuel price APIs
- Data transformation and validation
- Error handling and fallbacks
- Historical data fetching

### Chart Visualization

Uses **Chart.js** with **react-chartjs-2** for:
- Interactive line charts
- Price trend analysis
- Responsive design
- Tooltips and labels

### State Management

- React hooks for state management
- Async data fetching with error boundaries
- Loading states and user feedback

## 📱 Usage

### Main Interface

1. **Fuel Type Selector**: Choose between different fuel types
2. **Current Prices Panel**: Displays real-time prices from official sources
3. **Historical Chart**: Shows price trends over the selected period
4. **Information Section**: Details about data sources and app functionality

### Key Features

- **Real-time Updates**: Current prices refresh automatically
- **Historical Data**: View trends from 2023 to present
- **Multiple Views**: Switch between fuel types instantly
- **Mobile Friendly**: Optimized for all screen sizes

## 🎨 UI/UX Design

- **Modern Interface**: Clean, professional design
- **Color Coding**: Different colors for each fuel type
- **Animations**: Smooth transitions and loading states
- **Responsive**: Adapts to all device sizes
- **Accessible**: WCAG compliant color schemes

## 🔒 Data Privacy

- No user data is collected or stored
- All data comes from official government sources
- No tracking or analytics
- Open source and transparent

## 📝 License

This project is open source and available under the MIT License.

## 🤝 Contributing

Contributions are welcome! Please feel free to:

- Submit bug reports
- Suggest new features
- Improve documentation
- Add new fuel price sources
- Enhance the UI/UX

## 📞 Support

For issues or questions, please:

1. Check the FAQ below
2. Review the source code
3. Open an issue in the GitHub repository

## ❓ FAQ

### Q: Why can't I see real data?
A: The official Belgian APIs may be temporarily unavailable. The app will show estimated data based on recent trends.

### Q: How often is the data updated?
A: Current prices are fetched on each load. Historical data covers the past year.

### Q: Can I see older data?
A: Currently shows 2023-2024 data. You can modify the date range in the service.

### Q: Is this data official?
A: Yes, the app connects to official Belgian government fuel price databases.

### Q: Can I use this commercially?
A: Yes, this is open source under MIT license.

## 🌍 Belgian Fuel Price Context

Belgium has a regulated fuel market with prices set by:
- **Federal Government**: SPF Economie
- **Regional Governments**: Flanders, Wallonia, Brussels
- **Energy Taxes**: VAT and excise duties
- **Market Factors**: Global oil prices, currency exchange rates

House fuel (heating oil) is particularly important for:
- Residential heating
- Agricultural use
- Industrial applications
- Price stability monitoring

## 🎯 Future Enhancements

Potential improvements:
- Real-time price alerts
- Price comparison tools
- Export data functionality
- Multi-language support
- Price prediction models
- API for third-party integration

---

**Note**: This application connects to official Belgian government data sources. When APIs are unavailable, it provides estimated data based on historical trends to ensure continuous service.

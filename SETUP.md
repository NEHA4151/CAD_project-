# Personal Finance Tracker - Setup Guide

## Features Implemented

✅ **Personal Portfolio** - Track assets (equities, stocks, mutual funds, bonds)
✅ **Expense & Earning Tracker** - Monthly/yearly views with categorization
✅ **Asset Flowchart** - Visual representation with AI recommendations
✅ **Smart Insights** - Anomaly detection, auto-categorization, predictive balance, recurring expenses
✅ **Goal-Based Finance** - Micro-goals, goal impact simulation, emergency fund health score
✅ **Advanced Analytics** - Cash flow heatmap, lifestyle inflation tracker, needs vs wants split
✅ **Investments & Net Worth** - Timeline tracking, missed investment alerts, asset allocation drift
✅ **Gamification** - Spending streaks, financial levels, monthly finance score
✅ **Beautiful UI** - Black background (dark mode default), light/dark toggle, font size controls, responsive design

## Installation

1. Navigate to the project directory:
```bash
cd finance-tracker
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm start
```

The application will open at [http://localhost:3000](http://localhost:3000)

## Project Structure

```
finance-tracker/
├── public/
│   └── index.html
├── src/
│   ├── components/
│   │   ├── Layout/
│   │   │   ├── Sidebar.js
│   │   │   ├── Sidebar.css
│   │   │   ├── Header.js
│   │   │   └── Header.css
│   │   ├── Dashboard/
│   │   ├── Portfolio/
│   │   ├── ExpenseTracker/
│   │   ├── AssetFlowchart/
│   │   ├── SmartInsights/
│   │   ├── Goals/
│   │   ├── Analytics/
│   │   ├── Investments/
│   │   └── Gamification/
│   ├── contexts/
│   │   ├── ThemeContext.js
│   │   └── DataContext.js
│   ├── utils/
│   │   └── calculations.js
│   ├── App.js
│   ├── App.css
│   ├── index.js
│   └── index.css
├── package.json
└── README.md
```

## Key Features Details

### Portfolio Management
- Add assets manually with type, quantity, prices
- UI for linking Zerodha/Groww accounts (integration requires broker API keys)
- Track current value, profit/loss, and allocation

### Expense Tracker
- Add income and expense transactions
- Auto-categorization based on merchant names
- Monthly and yearly views with charts
- Category-wise breakdown

### AI Recommendations
- Asset-level buy/hold/sell recommendations
- Based on profit/loss percentages
- Confidence levels for each recommendation

### Smart Insights
- Spending anomaly detection (alerts when spending spikes)
- Recurring expense detection (subscriptions, bills)
- Predictive monthly balance
- Learning-based auto-categorization

### Goals
- Set financial goals with targets
- Micro-saving amounts (daily savings)
- Goal impact simulation
- Emergency fund health score

### Analytics
- Cash flow heatmap (visualize daily spending)
- Lifestyle inflation tracking
- Needs vs Wants classification
- Monthly trends

### Gamification
- Spending streaks (days under budget)
- Financial levels based on XP
- Monthly finance score (0-100)
- Achievement badges

## Data Storage

All data is stored in browser localStorage, so your data persists across sessions. For production use, consider migrating to a backend database.

## Broker Integration Note

The Zerodha/Groww integration UI is implemented, but actual API integration requires:
1. OAuth2 authentication flow
2. API keys from the broker
3. Secure token storage
4. Backend proxy for API calls (to keep keys secure)

For now, the UI shows the integration options, but you'll need to implement the actual API connections based on the broker's API documentation.

## Customization

- **Theme**: Toggle between dark and light mode in the header
- **Font Size**: Use A+/A- buttons to adjust font size
- **Categories**: Categories are defined in DataContext.js and can be customized

## Future Enhancements

- Backend API integration
- Real broker API connections
- Data export/import
- Multi-currency support
- Advanced reporting
- Email notifications

Enjoy tracking your finances! 💰


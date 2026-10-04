# Personal Finance Tracker

A full-stack personal finance application for tracking income, expenses, assets, goals, and financial behavior with an interactive dashboard, guided onboarding, and smart insights.

## Live Demo
https://personal-finance-tracker-flax-kappa.vercel.app/login


## What This App Includes

### 1) Dashboard

The dashboard gives a quick health-check of your finances:
- Net worth overview
- Monthly balance status
- Quick visibility into spending and earnings patterns
- Contextual cards for key financial metrics

### 2) Expense Tracker

A complete transaction workflow for daily money tracking:
- Add income and expense entries
- Categorize transactions (manual and assisted categorization)
- View data in monthly/yearly perspectives
- Visual summaries with chart components for trend recognition

### 3) Portfolio

Track your assets and monitor allocation:
- Add/update/delete assets
- View distribution of holdings
- Understand concentration and composition by asset type

### 4) Investments

Designed to monitor long-term growth and behavior:
- Net worth and investment trend charts
- Historical progression by month
- Allocation visibility and drift awareness

### 5) Goals

Goal-based planning features for disciplined saving:
- Create financial goals
- Track progress toward targets
- View emergency fund style indicators and balance impact

### 6) Smart Insights

Rule-based intelligence for better decisions:
- Spending anomaly detection
- Recurring expense detection
- Month-end balance prediction support
- Insight cards to highlight behavior that needs attention

### 7) Analytics

More detailed visual analysis:
- Chart-based breakdowns of spending and income
- Daily/monthly pattern views
- Deeper review of financial movement over time

### 8) Asset Flowchart

Visual flow of assets for quick understanding:
- Allocation representation
- Charted split between categories
- Supports better rebalancing decisions

### 9) Gamification

Keeps users engaged while building financial habits:
- Budget streak mechanics
- Score/progress style indicators
- Milestone-oriented feedback

### 10) Profile, Help, and Guide Experience

Supportive UX for easier adoption:
- Profile view for account details
- In-app help section
- Guided onboarding tour for first-time users
- Smooth navigation with protected routes for signed-in users

### 11) Responsive + Animated UI

Built for usability across devices:
- Mobile-friendly layout
- Sidebar + header adaptive behavior
- Auth and onboarding animations
- Clean dark/light-friendly structure

## Authentication and User Data

This project uses Supabase-based authentication and stores user identity for login/session flows:
- Signup flow creates users for immediate test login behavior
- Login uses saved credentials
- Session state is managed in app context for protected screens

## Tech Stack

- **Frontend:** React, React Router, Recharts, date-fns
- **Auth/DB Services:** Supabase
- **Backend:** Node.js, Express
- **Deployment:** Vercel (frontend), backend-ready service structure

## Project Structure

```text
Personal-Finance-Tracker/
├── src/                     # Frontend app (components, contexts, styles)
├── public/                  # Frontend static assets
├── backend/                 # Express backend services
├── api/                     # Vercel serverless routes
├── supabase/migrations/     # SQL migration files
├── vercel.json              # Vercel routing config
└── package.json
```

## Local Development

### Frontend

```bash
npm install
npm start
```

### Backend

```bash
cd backend
npm install
npm start
```

## Environment Variables

### Frontend (Vercel / local frontend runtime)

- `REACT_APP_SUPABASE_URL`
- `REACT_APP_SUPABASE_KEY`

### Backend / server-side

- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY` (or `SUPABASE_KEY` in current setup)
- `JWT_SECRET`
- `FRONTEND_URL`
- `PORT`

## Database Setup

Run the migration once in Supabase SQL editor:

- `supabase/migrations/001_pft_users.sql`

## Scripts

### Root

- `npm start` - run frontend
- `npm run build` - production frontend build

### Backend

- `npm start` - run Express server
- `npm run dev` - run backend in watch mode

## Notes

- Designed for fast testing and development workflows.
- Includes guided UX, help-oriented navigation, and feature-rich financial visualization.

# PortfolioIQ — Portfolio Risk & Return Optimization

A full-stack fintech dashboard that recommends an optimal stock portfolio
allocation using **Modern Portfolio Theory** (MPT): mean-variance
optimization, an efficient frontier built from 10,000 simulated portfolios,
and `scipy.optimize` solves for the Maximum Sharpe Ratio and Minimum
Volatility portfolios.

```
portfolio-optimizer/
├── backend/     FastAPI service — data fetching, MPT engine, PDF reports
└── frontend/    React 19 + Vite + Tailwind dashboard
```

---

## 1. Backend setup

```bash
cd backend
python3 -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

The API is now live at `http://127.0.0.1:8000`. Interactive docs at
`http://127.0.0.1:8000/docs`.

### API endpoints

| Method | Path          | Description                                  |
|--------|---------------|-----------------------------------------------|
| GET    | `/`           | Health check                                   |
| GET    | `/stocks`     | Curated list of available stocks               |
| POST   | `/optimize`   | Runs the MPT engine, returns full analysis     |
| POST   | `/report/pdf` | Renders a downloadable PDF of an analysis      |

**Note on data:** the backend calls Yahoo Finance via `yfinance`. If that
call fails for any reason — no internet, rate limiting, a firewalled venue
network — it automatically falls back to a seeded synthetic price series so
the demo never crashes. The API response includes `is_simulated_data: true`
whenever this fallback was used, and the frontend surfaces a visible notice
so nothing is presented as real market data without disclosure.

---

## 2. Frontend setup

```bash
cd frontend
npm install
npm run dev
```

The app is now live at `http://127.0.0.1:5173`. In development, Vite proxies
`/api/*` requests to `http://127.0.0.1:8000` (see `vite.config.js`), so no
extra configuration is needed as long as the backend is running.

### Production build

```bash
npm run build     # outputs to frontend/dist
npm run preview   # serve the production build locally
```

Before building for a separate-origin deployment, copy `.env.example` to
`.env` and set `VITE_API_URL` to your deployed backend's URL.

---

## 3. Running both together

Open two terminals:

```bash
# Terminal 1
cd backend && uvicorn main:app --reload --port 8000

# Terminal 2
cd frontend && npm run dev
```

Visit `http://127.0.0.1:5173`.

---

## 4. Deployment

**Backend** — any Python host works (Render, Railway, Fly.io, an EC2 box):

```bash
pip install -r requirements.txt
uvicorn main:app --host 0.0.0.0 --port $PORT
```

Set `CORSMiddleware` origins in `main.py` to your frontend's deployed URL
instead of `"*"` once you have it.

**Frontend** — any static host works (Vercel, Netlify, Cloudflare Pages):

```bash
npm run build
# deploy the frontend/dist folder
```

Set the `VITE_API_URL` environment variable in your hosting provider's
dashboard to your deployed backend URL before building.

---

## 5. Tech stack

**Frontend:** React 19, Vite, Tailwind CSS, React Router, Axios, Framer
Motion, Lucide Icons, Recharts, React Hook Form.

**Backend:** FastAPI, yfinance, pandas, numpy, scipy, scikit-learn,
uvicorn, reportlab (PDF export).

**Optimization approach:** daily/annualized returns → covariance matrix →
`scipy.optimize.minimize` (SLSQP) for Max Sharpe & Min Volatility
portfolios → a 10,000-portfolio Monte Carlo cloud for the efficient
frontier chart → a risk-level → target-return mapping that picks a point
along the frontier for "Low / Medium / High" risk preference.

---

## 6. Disclaimer

This project is built for a hackathon demonstration. It is **not**
financial advice. Historical returns and simulated data do not guarantee
future performance.

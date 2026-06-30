# 🌱 TSS Sirsi Arecanut Price Predictor

A modern, cloud-native web application designed to help farmers in the Sirsi region track live APMC market rates, predict future price trends using Machine Learning, and make data-driven decisions on when to sell their crops.

![App Preview](https://tss-price-predictor.vercel.app/favicon.ico)

## ✨ Core Features

*   **📊 Live Market Tracking:** Accurate daily tracking of Min, Max, and Average prices for Rashi, Kempu Gotu (K.G.), Chali Kempu (Ch. K), and Pepper.
*   **🤖 AI-Powered Predictions:** Uses a custom Linear Regression and Exponential Weighted Moving Average (EWMA) model to generate a 7-day future price forecast.
*   **💡 Actionable Insights:** Automatically analyzes market volatility and trend slopes to advise farmers whether to **Hold** for a peak or **Sell** before a drop.
*   **📱 WhatsApp Automation:** Integrates with Twilio Webhooks. The admin simply forwards the daily TSS WhatsApp message to a bot, which parses the text and updates the cloud database instantly.
*   **🌍 Localization:** Full Kannada and English language support, toggleable instantly.
*   **🌗 Adaptive Glassmorphism UI:** A premium, responsive interface featuring light/dark modes and a mobile-optimized layout.
*   **👀 Live Visitor Tracking:** A stateless, Redis-backed counter that tracks total dashboard visits.

## 🛠 Tech Stack

*   **Frontend:** Next.js (App Router), React, TypeScript, Chart.js (react-chartjs-2)
*   **Styling:** Vanilla CSS (CSS Modules) featuring a custom Glassmorphism aesthetic.
*   **Database:** Vercel KV / Upstash Redis for serverless data persistence.
*   **Hosting:** Vercel

## 🚀 Getting Started

### 1. Environment Setup
Create a `.env.local` file in the root directory and add the following keys:
```env
# Upstash Redis / Vercel KV Credentials
KV_REST_API_URL="your_redis_url"
KV_REST_API_TOKEN="your_redis_token"

# Admin Security
ADMIN_SECRET="your_custom_password"
ALLOWED_WHATSAPP_NUMBER="+919876543210" # Your phone number with country code
```

### 2. Local Development
```bash
npm install
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🤖 WhatsApp Bot Setup (Twilio)

To automate daily data entry without writing a single line of code:
1. Create a free **Twilio Sandbox for WhatsApp** account.
2. Set your Sandbox webhook URL to: `https://your-domain.vercel.app/api/whatsapp-webhook`
3. Ensure the HTTP method is set to **POST**.
4. Forward the daily APMC text message from your personal WhatsApp to your Twilio Bot number. The system will automatically parse the Sirsi block and update the Redis database.

## 📜 License
Developed for the farming community. © 2026 TSS Price Predictor.

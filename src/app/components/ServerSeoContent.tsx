import React from 'react';

interface MarketDataPoint {
  d: string;
  rn: number; ra: number; rx: number;
  kn: number; ka: number; kx: number;
  cn: number; ca: number; cx: number;
  pn: number; pa: number; px: number;
}

interface CommodityForecast {
  nextDayPred: number;
  trend7Days: number[];
  slope: number;
}

interface ServerSeoContentProps {
  latest: MarketDataPoint | null;
  formattedDate: string;
  rashiForecast: CommodityForecast;
  chaliForecast: CommodityForecast;
  kempuForecast: CommodityForecast;
  pepperForecast: CommodityForecast;
}

export default function ServerSeoContent({
  latest,
  formattedDate,
  rashiForecast,
  chaliForecast,
  kempuForecast,
  pepperForecast,
}: ServerSeoContentProps) {
  if (!latest) return null;

  return (
    <section 
      style={{
        marginTop: '3rem',
        padding: '2rem',
        borderRadius: '16px',
        background: 'var(--glass-bg)',
        border: '1px solid var(--glass-border)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        color: 'var(--text-main)'
      }}
      aria-label="TSS Sirsi Arecanut & Pepper Market Rates Summary"
    >
      {/* Primary Search Heading & Subheading (English + Kannada) */}
      <div style={{ marginBottom: '2rem', borderBottom: '1px solid var(--glass-border)', paddingBottom: '1rem' }}>
        <h1 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: '0.5rem', color: 'var(--text-main)' }}>
          Arecanut and Pepper Price at TSS Sirsi Today ({formattedDate}) | ಶಿರಸಿ ಅಡಿಕೆ ಮತ್ತು ಕಾಳುಮೆಣಸು ಇಂದಿನ ಮಾರುಕಟ್ಟೆ ದರ
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '1rem', lineHeight: '1.6' }}>
          Official live APMC market rates from The Totagars&apos; Co-Operative Sale Society (TSS) Sirsi. View daily Min, Max, Average prices for Rashi, Chali, Kempu Gotu, and Pepper alongside AI-powered 7-day price forecasts.
        </p>
      </div>

      {/* Indexable Live Market Rate Table */}
      <div style={{ overflowX: 'auto', marginBottom: '2.5rem' }}>
        <h2 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '1rem' }}>
          📊 Today&apos;s Official Rates (ಇಂದಿನ ಮಾರುಕಟ್ಟೆ ದರಗಳ ವಿವರ)
        </h2>
        <table 
          style={{
            width: '100%',
            borderCollapse: 'collapse',
            textAlign: 'left',
            fontSize: '0.95rem'
          }}
        >
          <thead>
            <tr style={{ borderBottom: '2px solid var(--glass-border)', background: 'rgba(255, 255, 255, 0.05)' }}>
              <th style={{ padding: '0.75rem 1rem' }}>Commodity (ಸರಕು / ತಳಿ)</th>
              <th style={{ padding: '0.75rem 1rem' }}>Min Price (ಕನಿಷ್ಠ ₹)</th>
              <th style={{ padding: '0.75rem 1rem' }}>Max Price (ಗರಿಷ್ಠ ₹)</th>
              <th style={{ padding: '0.75rem 1rem' }}>Avg Price (ಸರಾಸರಿ ₹)</th>
              <th style={{ padding: '0.75rem 1rem' }}>Tomorrow&apos;s Forecast (ನಾಳೆಯ ಮುನ್ಸೂಚನೆ)</th>
            </tr>
          </thead>
          <tbody>
            <tr style={{ borderBottom: '1px solid var(--glass-border)' }}>
              <td style={{ padding: '0.75rem 1rem', fontWeight: 600 }}>Rashi Arecanut (ರಾಶಿ ಅಡಿಕೆ)</td>
              <td style={{ padding: '0.75rem 1rem' }}>₹{latest.rn.toLocaleString('en-IN')}</td>
              <td style={{ padding: '0.75rem 1rem' }}>₹{latest.rx.toLocaleString('en-IN')}</td>
              <td style={{ padding: '0.75rem 1rem', fontWeight: 700, color: 'var(--accent-green)' }}>₹{latest.ra.toLocaleString('en-IN')}</td>
              <td style={{ padding: '0.75rem 1rem', fontWeight: 600 }}>₹{rashiForecast.nextDayPred.toLocaleString('en-IN')} / Quintal</td>
            </tr>
            <tr style={{ borderBottom: '1px solid var(--glass-border)' }}>
              <td style={{ padding: '0.75rem 1rem', fontWeight: 600 }}>Chali Kempu Arecanut (ಚಾಲಿ ಕೆಂಪು ಅಡಿಕೆ)</td>
              <td style={{ padding: '0.75rem 1rem' }}>₹{latest.cn.toLocaleString('en-IN')}</td>
              <td style={{ padding: '0.75rem 1rem' }}>₹{latest.cx.toLocaleString('en-IN')}</td>
              <td style={{ padding: '0.75rem 1rem', fontWeight: 700, color: 'var(--accent-green)' }}>₹{latest.ca.toLocaleString('en-IN')}</td>
              <td style={{ padding: '0.75rem 1rem', fontWeight: 600 }}>₹{chaliForecast.nextDayPred.toLocaleString('en-IN')} / Quintal</td>
            </tr>
            <tr style={{ borderBottom: '1px solid var(--glass-border)' }}>
              <td style={{ padding: '0.75rem 1rem', fontWeight: 600 }}>Kempu Gotu Arecanut (ಕೆಂಪು ಗೋಟು ಅಡಿಕೆ)</td>
              <td style={{ padding: '0.75rem 1rem' }}>₹{latest.kn.toLocaleString('en-IN')}</td>
              <td style={{ padding: '0.75rem 1rem' }}>₹{latest.kx.toLocaleString('en-IN')}</td>
              <td style={{ padding: '0.75rem 1rem', fontWeight: 700, color: 'var(--accent-green)' }}>₹{latest.ka.toLocaleString('en-IN')}</td>
              <td style={{ padding: '0.75rem 1rem', fontWeight: 600 }}>₹{kempuForecast.nextDayPred.toLocaleString('en-IN')} / Quintal</td>
            </tr>
            <tr style={{ borderBottom: '1px solid var(--glass-border)' }}>
              <td style={{ padding: '0.75rem 1rem', fontWeight: 600 }}>Black Pepper (ಕಾಳುಮೆಣಸು)</td>
              <td style={{ padding: '0.75rem 1rem' }}>₹{latest.pn.toLocaleString('en-IN')}</td>
              <td style={{ padding: '0.75rem 1rem' }}>₹{latest.px.toLocaleString('en-IN')}</td>
              <td style={{ padding: '0.75rem 1rem', fontWeight: 700, color: 'var(--accent-green)' }}>₹{latest.pa.toLocaleString('en-IN')}</td>
              <td style={{ padding: '0.75rem 1rem', fontWeight: 600 }}>₹{pepperForecast.nextDayPred.toLocaleString('en-IN')} / Quintal</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Tomorrow's Forecast Summary Section */}
      <div style={{ marginBottom: '2.5rem' }}>
        <h2 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '0.75rem' }}>
          🔮 Tomorrow Sirsi Adike Price Forecast & AI Trend Analysis (ನಾಳೆಯ ಅಡಿಕೆ ಧಾರಣೆ ಮುನ್ಸೂಚನೆ)
        </h2>
        <p style={{ lineHeight: '1.7', color: 'var(--text-muted)' }}>
          Based on historical APMC arrivals and exponential weighted moving average (EWMA) machine learning models, the estimated tomorrow price for <strong>Rashi Arecanut</strong> at TSS Sirsi is projected at <strong>₹{rashiForecast.nextDayPred.toLocaleString('en-IN')}/Quintal</strong>. 
          For farmers planning when to sell their betel nut crop in Uttara Kannada, our model updates live every day as soon as official TSS auction details are declared.
        </p>
      </div>

      {/* Indexable Frequently Asked Questions (FAQs) */}
      <div>
        <h2 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '1.25rem' }}>
          ❓ Frequently Asked Questions (FAQ) - TSS Sirsi Market
        </h2>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <details style={{ padding: '1rem', borderRadius: '8px', background: 'rgba(255, 255, 255, 0.03)', border: '1px solid var(--glass-border)' }}>
            <summary style={{ fontWeight: 700, cursor: 'pointer', outline: 'none' }}>
              What is today&apos;s TSS Sirsi Arecanut Rashi price? (ಶಿರಸಿ ಟಿ.ಎಸ್.ಎಸ್ ಇಂದಿನ ರಾಶಿ ಅಡಿಕೆ ದರ ಎಷ್ಟು?)
            </summary>
            <p style={{ marginTop: '0.75rem', lineHeight: '1.6', color: 'var(--text-muted)' }}>
              As of {formattedDate}, the average Rashi Arecanut price at TSS Sirsi is ₹{latest.ra.toLocaleString('en-IN')} per quintal, with a minimum price of ₹{latest.rn.toLocaleString('en-IN')} and maximum of ₹{latest.rx.toLocaleString('en-IN')}.
            </p>
          </details>

          <details style={{ padding: '1rem', borderRadius: '8px', background: 'rgba(255, 255, 255, 0.03)', border: '1px solid var(--glass-border)' }}>
            <summary style={{ fontWeight: 700, cursor: 'pointer', outline: 'none' }}>
              What is the expected tomorrow Sirsi adike price? (ನಾಳೆಯ ಶಿರಸಿ ಅಡಿಕೆ ಬೆಲೆ ಮುನ್ಸೂಚನೆ ಏನು?)
            </summary>
            <p style={{ marginTop: '0.75rem', lineHeight: '1.6', color: 'var(--text-muted)' }}>
              Our machine learning prediction engine forecasts tomorrow&apos;s average Rashi price at approximately ₹{rashiForecast.nextDayPred.toLocaleString('en-IN')} per quintal, based on recent tender trends and arrival volumes.
            </p>
          </details>

          <details style={{ padding: '1rem', borderRadius: '8px', background: 'rgba(255, 255, 255, 0.03)', border: '1px solid var(--glass-border)' }}>
            <summary style={{ fontWeight: 700, cursor: 'pointer', outline: 'none' }}>
              How frequently are TSS Sirsi market rates updated?
            </summary>
            <p style={{ marginTop: '0.75rem', lineHeight: '1.6', color: 'var(--text-muted)' }}>
              Market rates update daily in real-time as soon as the official Totagars&apos; Cooperative Sale Society (TSS) Sirsi APMC tender results are declared.
            </p>
          </details>

          <details style={{ padding: '1rem', borderRadius: '8px', background: 'rgba(255, 255, 255, 0.03)', border: '1px solid var(--glass-border)' }}>
            <summary style={{ fontWeight: 700, cursor: 'pointer', outline: 'none' }}>
              What is today&apos;s Black Pepper (Kalumenasu) price at TSS Sirsi? (ಶಿರಸಿ ಕಾಳುಮೆಣಸು ಬೆಲೆ ಎಷ್ಟು?)
            </summary>
            <p style={{ marginTop: '0.75rem', lineHeight: '1.6', color: 'var(--text-muted)' }}>
              Today&apos;s average Black Pepper price at TSS Sirsi is ₹{latest.pa.toLocaleString('en-IN')} per quintal (ranging from ₹{latest.pn.toLocaleString('en-IN')} min to ₹{latest.px.toLocaleString('en-IN')} max).
            </p>
          </details>
        </div>
      </div>
    </section>
  );
}

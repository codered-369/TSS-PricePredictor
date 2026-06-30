'use client';

import { useEffect, useState } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { TrendingUp, TrendingDown, AlertCircle, RefreshCw, CalendarDays, CheckCircle, Plus, Eye, Sun, Moon, Languages } from 'lucide-react';
import styles from './page.module.css';
import { predict7, predictStats } from '@/lib/ml';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

const TRANSLATIONS = {
  en: {
    title: "TSS Sirsi Smart Predictor",
    subtitle: "Advanced 7-Day Market Intelligence for Arecanut Farmers",
    fetchBtn: "Fetch Napanta Rates",
    fetching: "Fetching...",
    manualBtn: "Add Manual Entry",
    commodity: "Commodity",
    histDate: "Historical Date",
    currPrice: "Current Price",
    peakForecast: "7-Day Peak Forecast",
    expectedOn: "Expected on",
    marketSignal: "Market Signal",
    confidence: "Confidence",
    bullish: "Strong Bullish ↑",
    bearish: "Bearish ↓",
    sideways: "Sideways →",
    sevenDayDetailed: "7-Day Detailed Forecast",
    trendProj: "Price Trend & Projection",
    marketRatesFor: "Market Rates for",
    noData: "No market data available for this date.",
    avg: "Average",
    min: "Minimum",
    max: "Maximum",
    vsYest: "vs yesterday",
    histAvg: "Historical Avg",
    forecastLabel: "7-Day Forecast",
    actionInsight: "Actionable Insight for",
    actionWait: "Hold your crop! Prices are expected to peak at ₹{price} on {date}. Send your product to market then.",
    actionSell: "Bearish market ahead. The price is dropping. It is highly recommended to sell immediately before prices fall further.",
    actionNeutral: "Prices are stable around ₹{price}. You can sell now or wait for minor fluctuations.",
    R: "Rashi",
    K: "K.G (Kempu Gotu)",
    C: "Ch.K (Chali Kempu)",
    P: "Pepper",
    addManualHeader: "Add Manual Market Rates",
    cancel: "Cancel",
    saveAndTrain: "Save & Train Model"
  },
  kn: {
    title: "TSS ಶಿರಸಿ ಸ್ಮಾರ್ಟ್ ಭವಿಷ್ಯ",
    subtitle: "ಅಡಿಕೆ ಬೆಳೆಗಾರರಿಗೆ ಸುಧಾರಿತ 7-ದಿನಗಳ ಮಾರುಕಟ್ಟೆ ಮಾಹಿತಿ",
    fetchBtn: "ಹೊಸ ಬೆಲೆಗಳನ್ನು ಪಡೆಯಿರಿ",
    fetching: "ಪಡೆಯಲಾಗುತ್ತಿದೆ...",
    manualBtn: "ಹಸ್ತಚಾಲಿತ ಬೆಲೆ ಸೇರಿಸಿ",
    commodity: "ವಸ್ತು",
    histDate: "ಐತಿಹಾಸಿಕ ದಿನಾಂಕ",
    currPrice: "ಪ್ರಸ್ತುತ ಬೆಲೆ",
    peakForecast: "7-ದಿನದ ಗರಿಷ್ಠ ಭವಿಷ್ಯ",
    expectedOn: "ನಿರೀಕ್ಷಿತ",
    marketSignal: "ಮಾರುಕಟ್ಟೆ ಸಂಕೇತ",
    confidence: "ಖಚಿತತೆ",
    bullish: "ಹೆಚ್ಚಳದ ನಿರೀಕ್ಷೆ ↑",
    bearish: "ಇಳಿಕೆಯ ನಿರೀಕ್ಷೆ ↓",
    sideways: "ಸ್ಥಿರವಾಗಿದೆ →",
    sevenDayDetailed: "7-ದಿನಗಳ ವಿವರವಾದ ಭವಿಷ್ಯ",
    trendProj: "ಬೆಲೆ ಪ್ರವೃತ್ತಿ ಮತ್ತು ಪ್ರಕ್ಷೇಪಣ",
    marketRatesFor: "ಮಾರುಕಟ್ಟೆ ದರಗಳು:",
    noData: "ಈ ದಿನಾಂಕಕ್ಕೆ ಯಾವುದೇ ಮಾಹಿತಿ ಲಭ್ಯವಿಲ್ಲ.",
    avg: "ಸರಾಸರಿ",
    min: "ಕನಿಷ್ಠ",
    max: "ಗರಿಷ್ಠ",
    vsYest: "ನಿನ್ನೆಗಿಂತ",
    histAvg: "ಐತಿಹಾಸಿಕ ಸರಾಸರಿ",
    forecastLabel: "7-ದಿನದ ಭವಿಷ್ಯ",
    actionInsight: "ಇದಕ್ಕಾಗಿ ಸಲಹೆ:",
    actionWait: "ನಿಮ್ಮ ಬೆಳೆಯನ್ನು ಹಿಡಿದಿಟ್ಟುಕೊಳ್ಳಿ! {date} ರಂದು ಬೆಲೆಗಳು ₹{price} ತಲುಪುವ ನಿರೀಕ್ಷೆಯಿದೆ. ಆ ದಿನ ಮಾರುಕಟ್ಟೆಗೆ ಕಳುಹಿಸಿ.",
    actionSell: "ಮಾರುಕಟ್ಟೆ ಕುಸಿಯುವ ಸಾಧ್ಯತೆ ಇದೆ. ಬೆಲೆಗಳು ಇನ್ನಷ್ಟು ಕುಸಿಯುವ ಮುನ್ನ ತಕ್ಷಣ ಮಾರಾಟ ಮಾಡಲು ಶಿಫಾರಸು ಮಾಡಲಾಗಿದೆ.",
    actionNeutral: "ಬೆಲೆಗಳು ₹{price} ರ ಆಸುಪಾಸಿನಲ್ಲಿ ಸ್ಥಿರವಾಗಿವೆ. ನೀವು ಈಗ ಮಾರಾಟ ಮಾಡಬಹುದು ಅಥವಾ ಸಣ್ಣ ಬದಲಾವಣೆಗಾಗಿ ಕಾಯಬಹುದು.",
    R: "ರಾಶಿ",
    K: "ಕೆ.ಜಿ (ಕೆಂಪು ಗೋಟು)",
    C: "ಚಾಲಿ ಕೆಂಪು",
    P: "ಕಾಳುಮೆಣಸು",
    addManualHeader: "ಹಸ್ತಚಾಲಿತ ಮಾರುಕಟ್ಟೆ ದರಗಳನ್ನು ಸೇರಿಸಿ",
    cancel: "ರದ್ದುಮಾಡಿ",
    saveAndTrain: "ಉಳಿಸಿ ಮತ್ತು ಮಾಡೆಲ್ ತರಬೇತಿ ನೀಡಿ"
  }
};

const ITEMS = {
  R: { color: '#10b981', avgKey: 'ra', minKey: 'rn', maxKey: 'rx', emoji: '🌰' },
  K: { color: '#f59e0b', avgKey: 'ka', minKey: 'kn', maxKey: 'kx', emoji: '🌰' },
  C: { color: '#ef4444', avgKey: 'ca', minKey: 'cn', maxKey: 'cx', emoji: '🌰' },
  P: { color: '#3b82f6', avgKey: 'pa', minKey: 'pn', maxKey: 'px', emoji: '🌶️' },
};

export default function Dashboard() {
  const [data, setData] = useState<any[]>([]);
  const [activeItem, setActiveItem] = useState('R');
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [selectedDate, setSelectedDate] = useState(''); // Format: YYYY-MM-DD for the input
  const [showManualModal, setShowManualModal] = useState(false);
  const [visitors, setVisitors] = useState<number | null>(null);
  
  const [lang, setLang] = useState<'en'|'kn'>('en');
  const [theme, setTheme] = useState<'dark'|'light'>('dark');

  const t = TRANSLATIONS[lang];

  const todayForInput = new Date();
  const [manualData, setManualData] = useState({
    d: `${String(todayForInput.getDate()).padStart(2, '0')}-${String(todayForInput.getMonth() + 1).padStart(2, '0')}-${String(todayForInput.getFullYear()).slice(2)}`,
    secret: '',
    rn: 0, ra: 0, rx: 0,
    kn: 0, ka: 0, kx: 0,
    cn: 0, ca: 0, cx: 0,
    pn: 0, pa: 0, px: 0
  });

  const parseToInputDate = (dStr: string) => {
    if (!dStr) return '';
    const [dd, mm, yy] = dStr.split('-');
    return `20${yy}-${mm}-${dd}`;
  };

  const parseToInternalDate = (inputStr: string) => {
    if (!inputStr) return '';
    const [yyyy, mm, dd] = inputStr.split('-');
    return `${dd}-${mm}-${yyyy.slice(2)}`;
  };

  const loadData = async () => {
    try {
      const res = await fetch('/api/data');
      const json = await res.json();
      const loadedData = json.data;

      // Automatic Daily Fetch Check
      if (loadedData && loadedData.length > 0) {
        const lastEntry = loadedData[loadedData.length - 1];
        const today = new Date();
        const d = `${String(today.getDate()).padStart(2, '0')}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getFullYear()).slice(2)}`;

        if (lastEntry.d !== d) {
          fetch('/api/fetch-prices').then(() => {
            fetch('/api/data').then(r => r.json()).then(j => setData(j.data));
          });
        }
      }

      setData(loadedData);
      if (loadedData.length > 0) {
        setSelectedDate(parseToInputDate(loadedData[loadedData.length - 1].d));
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    // Fetch visitor count
    fetch('/api/visitors')
      .then(res => res.json())
      .then(data => setVisitors(data.count))
      .catch(e => console.error(e));
      
    // Load preferences
    const savedLang = localStorage.getItem('tss_lang') as 'en'|'kn';
    if (savedLang) setLang(savedLang);
    const savedTheme = localStorage.getItem('tss_theme') as 'dark'|'light';
    if (savedTheme) {
      setTheme(savedTheme);
      document.body.classList.toggle('light-mode', savedTheme === 'light');
    }
  }, []);

  const toggleLang = () => {
    const newLang = lang === 'en' ? 'kn' : 'en';
    setLang(newLang);
    localStorage.setItem('tss_lang', newLang);
  };

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    localStorage.setItem('tss_theme', newTheme);
    document.body.classList.toggle('light-mode', newTheme === 'light');
  };

  const syncPrices = async () => {
    setSyncing(true);
    try {
      const res = await fetch('/api/fetch-prices');
      await res.json();
      await loadData();
    } catch (e) {
      console.error(e);
    } finally {
      setSyncing(false);
    }
  };

  const handleManualSubmit = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/add-manual', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(manualData)
      });

      const result = await res.json();
      if (!res.ok) {
        alert(result.error || 'Failed to save data');
        return;
      }

      await loadData();
      setShowManualModal(false);
    } catch (e) {
      console.error(e);
      alert('An error occurred while saving.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div style={{ color: 'var(--text-main)', padding: '2rem', textAlign: 'center' }}>Loading prediction engine...</div>;
  if (!data.length) return <div style={{ color: 'var(--text-main)' }}>No data found.</div>;

  const itemDef = ITEMS[activeItem as keyof typeof ITEMS];
  const itemLabel = t[activeItem as keyof typeof t];
  const avgs = data.map((d) => d[itemDef.avgKey] || 0);
  const labels = data.map((d) => d.d);

  const latestAvg = avgs[avgs.length - 1];
  const prevAvg = avgs[avgs.length - 2] || latestAvg;
  const pctChange = (((latestAvg - prevAvg) / prevAvg) * 100).toFixed(1);
  const isUp = latestAvg >= prevAvg;

  // Predictions
  const p7 = predict7(avgs);
  const stats = predictStats(avgs);

  // Actionable Insight logic
  const peakPrice = Math.max(...p7);
  const peakIndex = p7.indexOf(peakPrice);
  const currentDiffToPeak = peakPrice - latestAvg;

  // Future dates
  const today = new Date();
  const futureLabels = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today);
    d.setDate(d.getDate() + i + 1); // +1 because prediction is T+1 to T+7
    return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  });

  let actionText = '';
  let actionType = 'wait';

  if (currentDiffToPeak > 500 && peakIndex > 1) {
    actionText = t.actionWait.replace('{price}', peakPrice.toLocaleString()).replace('{date}', futureLabels[peakIndex]);
    actionType = 'wait';
  } else if (stats.slope < -100) {
    actionText = t.actionSell;
    actionType = 'sell';
  } else {
    actionText = t.actionNeutral.replace('{price}', latestAvg.toLocaleString());
    actionType = 'neutral';
  }

  // Chart Data
  const SL = Math.min(60, data.length);
  const chartLabels = [...labels.slice(-SL), ...futureLabels];
  const chartDataHist = [...avgs.slice(-SL), ...Array(7).fill(null)];
  const chartDataPred = [...Array(SL - 1).fill(null), avgs[avgs.length - 1], ...p7];

  const chartData = {
    labels: chartLabels,
    datasets: [
      {
        label: t.histAvg,
        data: chartDataHist,
        borderColor: itemDef.color,
        backgroundColor: `${itemDef.color}33`,
        fill: true,
        tension: 0.3,
        pointRadius: 1,
      },
      {
        label: t.forecastLabel,
        data: chartDataPred,
        borderColor: '#f59e0b',
        borderDash: [5, 5],
        tension: 0.3,
        pointRadius: 4,
        pointBackgroundColor: '#f59e0b',
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { labels: { color: theme === 'dark' ? 'white' : '#0f172a' } },
    },
    scales: {
      x: { ticks: { color: '#94a3b8' }, grid: { display: false } },
      y: { ticks: { color: '#94a3b8' }, grid: { color: theme === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)' } }
    }
  };

  return (
    <div className={styles.container}>
      <header className={styles.header} style={{ position: 'relative' }}>
        <div style={{ position: 'absolute', top: 0, right: 0, display: 'flex', gap: '0.5rem' }}>
          <button onClick={toggleLang} style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', color: 'var(--text-main)', padding: '0.5rem', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            <Languages size={18} /> {lang === 'en' ? 'ಕನ್ನಡ' : 'English'}
          </button>
          <button onClick={toggleTheme} style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', color: 'var(--text-main)', padding: '0.5rem', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>
        </div>
        <h1 className={styles.textGradient}>{t.title}</h1>
        <p>{t.subtitle}</p>
      </header>

      {/* Actionable Banner */}
      <div className={`${styles.actionBanner} ${styles[actionType] || ''}`}>
        {actionType === 'wait' ? <CalendarDays size={28} /> : actionType === 'sell' ? <AlertCircle size={28} /> : <CheckCircle size={28} />}
        <div>
          <div style={{ fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '1px', opacity: 0.8, marginBottom: '4px' }}>
            {t.actionInsight} {itemLabel}
          </div>
          {actionText}
        </div>
      </div>

      <div className={styles.grid}>
        {/* Sidebar */}
        <aside className={styles.sidebar}>
          <button className={styles.syncBtn} onClick={syncPrices} disabled={syncing}>
            <RefreshCw size={18} className={syncing ? 'spin' : ''} />
            {syncing ? t.fetching : t.fetchBtn}
          </button>

          <button className={styles.syncBtn} onClick={() => setShowManualModal(true)} style={{ background: 'var(--accent-green)' }}>
            <Plus size={18} />
            {t.manualBtn}
          </button>

          <div style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <h3 style={{ fontSize: '0.9rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '4px' }}>{t.commodity}</h3>
            {Object.entries(ITEMS).map(([key, item]) => (
              <button
                key={key}
                className={`${styles.commodityBtn} ${activeItem === key ? styles.active : ''}`}
                onClick={() => setActiveItem(key)}
              >
                {item.emoji} {t[key as keyof typeof t]}
              </button>
            ))}
          </div>

          <div style={{ marginTop: '2rem' }}>
            <h3 style={{ fontSize: '0.9rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>{t.histDate}</h3>
            <input
              type="date"
              className={styles.datePicker}
              style={{ width: '100%' }}
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              max={data.length > 0 ? parseToInputDate(data[data.length - 1].d) : undefined}
              min={data.length > 0 ? parseToInputDate(data[0].d) : undefined}
            />
          </div>
        </aside>

        {/* Main Content */}
        <main className={styles.mainContent}>

          {/* KPI Grid */}
          <div className={styles.kpiGrid}>
            <div className={`${styles.kpiCard} glass`}>
              <div className={styles.kpiLabel}>{t.currPrice}</div>
              <div className={styles.kpiValue}>₹{latestAvg.toLocaleString()}</div>
              <div className={`${styles.kpiSub} ${isUp ? styles.up : styles.down}`}>
                {isUp ? <TrendingUp size={14} style={{ display: 'inline', verticalAlign: 'middle' }} /> : <TrendingDown size={14} style={{ display: 'inline', verticalAlign: 'middle' }} />}
                {' '}{Math.abs(Number(pctChange))}% {t.vsYest}
              </div>
            </div>
            <div className={`${styles.kpiCard} glass`}>
              <div className={styles.kpiLabel}>{t.peakForecast}</div>
              <div className={styles.kpiValue} style={{ color: 'var(--accent-amber)' }}>₹{peakPrice.toLocaleString()}</div>
              <div className={styles.kpiSub}>{t.expectedOn} {futureLabels[peakIndex]}</div>
            </div>
            <div className={`${styles.kpiCard} glass`}>
              <div className={styles.kpiLabel}>{t.marketSignal}</div>
              <div className={styles.kpiValue} style={{ fontSize: '1.5rem', marginTop: '0.2rem' }}>
                {stats.slope > 50 ? t.bullish : stats.slope < -50 ? t.bearish : t.sideways}
              </div>
              <div className={styles.kpiSub}>{t.confidence}: {stats.conf}%</div>
            </div>
          </div>

          {/* 7-Day Forecast Strip */}
          <div className={`${styles.chartCard} glass`} style={{ minHeight: 'auto' }}>
            <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>{t.sevenDayDetailed}</h3>
            <div className={styles.forecastGrid}>
              {p7.map((price, i) => {
                const isPeak = i === peakIndex;
                const change = price - latestAvg;
                return (
                  <div key={i} className={`${styles.forecastDay} ${isPeak ? styles.peak : ''}`}>
                    <div className={styles.fDayName}>{futureLabels[i].split(',')[0]}</div>
                    <div className={styles.fPrice}>₹{price.toLocaleString()}</div>
                    <div className={`${styles.fTrend} ${change >= 0 ? styles.up : styles.down}`}>
                      {change >= 0 ? '+' : ''}{change}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Chart */}
          <div className={`${styles.chartCard} glass`}>
            <div className={styles.chartHeader}>
              <div className={styles.chartTitle}>{t.trendProj}</div>
            </div>
            <div style={{ height: '300px' }}>
              <Line data={chartData} options={chartOptions as any} />
            </div>
          </div>
        </main>

        {/* Right Sidebar */}
        <aside className={styles.rightSidebar}>
          {/* Today's / Selected Date Prices for All Items */}
          <div className={`${styles.chartCard} glass`} style={{ minHeight: 'auto', background: 'var(--accent-blue-bg, rgba(59, 130, 246, 0.05))', borderColor: 'rgba(59, 130, 246, 0.2)' }}>
            <div className={styles.chartHeader} style={{ marginBottom: '1rem' }}>
              <div className={styles.chartTitle} style={{ fontSize: '1.1rem' }}>{t.marketRatesFor} {selectedDate || ''}</div>
            </div>
            {(() => {
              const internalDate = parseToInternalDate(selectedDate);
              const dayData = data.find(d => d.d === internalDate);

              if (!dayData) {
                return <div style={{ color: 'var(--text-muted)', padding: '1rem', textAlign: 'center' }}>
                  {t.noData}
                </div>;
              }

              return (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {Object.entries(ITEMS).map(([key, item]) => (
                    <div key={key} className={styles.historyCard} style={{ background: 'var(--glass-bg)' }}>
                      <div className={styles.hCardHeader} style={{ color: item.color }}>
                        {item.emoji} {t[key as keyof typeof t]}
                      </div>
                      <div className={styles.hRow}>
                        <span className={styles.hLabel}>{t.avg}</span>
                        <span className={styles.hVal}>₹{dayData[item.avgKey].toLocaleString()}</span>
                      </div>
                      <div className={styles.hRow}>
                        <span className={styles.hLabel}>{t.min}</span>
                        <span className={styles.hVal} style={{ color: 'var(--accent-red)' }}>₹{dayData[item.minKey].toLocaleString()}</span>
                      </div>
                      <div className={styles.hRow}>
                        <span className={styles.hLabel}>{t.max}</span>
                        <span className={styles.hVal} style={{ color: 'var(--accent-green)' }}>₹{dayData[item.maxKey].toLocaleString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              );
            })()}
          </div>
        </aside>
      </div>

      {showManualModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <h2 style={{ fontSize: '1.5rem' }}>{t.addManualHeader}</h2>
              <button onClick={() => setShowManualModal(false)} style={{ background: 'transparent', border: 'none', color: 'var(--text-main)', cursor: 'pointer', fontSize: '1.5rem' }}>×</button>
            </div>

            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>Date (DD-MM-YY)</label>
                <input
                  type="text"
                  value={manualData.d}
                  onChange={e => setManualData({ ...manualData, d: e.target.value })}
                  style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', color: 'var(--text-main)', padding: '0.75rem', borderRadius: '6px', width: '100%' }}
                />
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>Admin Secret Password</label>
                <input
                  type="password"
                  placeholder="Enter secret to allow save..."
                  value={manualData.secret}
                  onChange={e => setManualData({ ...manualData, secret: e.target.value })}
                  style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', color: 'var(--text-main)', padding: '0.75rem', borderRadius: '6px', width: '100%' }}
                />
              </div>
            </div>

            {Object.entries(ITEMS).map(([key, item]) => (
              <div key={key} style={{ marginBottom: '1.5rem', background: 'rgba(128,128,128,0.05)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--glass-border)' }}>
                <h3 style={{ color: item.color, marginBottom: '1rem', fontSize: '1.1rem' }}>{item.emoji} {t[key as keyof typeof t]}</h3>
                <div className={styles.formGrid}>
                  <div className={styles.formGroup}>
                    <label style={{color: 'var(--text-main)'}}>{t.min}</label>
                    <input style={{color: 'var(--text-main)', background: 'var(--glass-bg)', border: '1px solid var(--glass-border)'}} type="number" onChange={e => setManualData({ ...manualData, [item.minKey]: parseInt(e.target.value) || 0 })} />
                  </div>
                  <div className={styles.formGroup}>
                    <label style={{color: 'var(--text-main)'}}>{t.avg}</label>
                    <input style={{color: 'var(--text-main)', background: 'var(--glass-bg)', border: '1px solid var(--glass-border)'}} type="number" onChange={e => setManualData({ ...manualData, [item.avgKey]: parseInt(e.target.value) || 0 })} />
                  </div>
                  <div className={styles.formGroup}>
                    <label style={{color: 'var(--text-main)'}}>{t.max}</label>
                    <input style={{color: 'var(--text-main)', background: 'var(--glass-bg)', border: '1px solid var(--glass-border)'}} type="number" onChange={e => setManualData({ ...manualData, [item.maxKey]: parseInt(e.target.value) || 0 })} />
                  </div>
                </div>
              </div>
            ))}

            <div className={styles.modalActions}>
              <button className={styles.syncBtn} onClick={() => setShowManualModal(false)} style={{ background: 'var(--glass-bg)', color: 'var(--text-main)', border: '1px solid var(--glass-border)' }}>{t.cancel}</button>
              <button className={styles.syncBtn} onClick={handleManualSubmit} style={{ background: 'var(--accent-green)', color: 'white' }}>{t.saveAndTrain}</button>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer style={{ marginTop: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.5rem 0', borderTop: '1px solid var(--glass-border)', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
        {visitors !== null ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', background: '#0ea5e9', color: 'white', padding: '0.3rem 0.8rem', borderRadius: '999px', fontWeight: 'bold', boxShadow: '0 4px 12px rgba(14, 165, 233, 0.25)' }}>
            <Eye size={14} />
            {visitors}
          </div>
        ) : <div />}
        <div>
          © {new Date().getFullYear()} TSS Price Predictor
        </div>
      </footer>

      <style jsx global>{`
        .spin { animation: spin 1s linear infinite; }
        @keyframes spin { 100% { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}

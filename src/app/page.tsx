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
import { TrendingUp, TrendingDown, AlertCircle, RefreshCw, CalendarDays, CheckCircle, Plus, Eye } from 'lucide-react';
import styles from './page.module.css';
import { predict7, predictStats } from '@/lib/ml';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

const ITEMS = {
  R: { label: 'Rashi', color: '#10b981', avgKey: 'ra', minKey: 'rn', maxKey: 'rx', emoji: '🌰' },
  K: { label: 'K.G (Kempu Gotu)', color: '#f59e0b', avgKey: 'ka', minKey: 'kn', maxKey: 'kx', emoji: '🌰' },
  C: { label: 'Ch.K (Chali Kempu)', color: '#ef4444', avgKey: 'ca', minKey: 'cn', maxKey: 'cx', emoji: '🌰' },
  P: { label: 'Pepper', color: '#3b82f6', avgKey: 'pa', minKey: 'pn', maxKey: 'px', emoji: '🌶️' },
};

export default function Dashboard() {
  const [data, setData] = useState<any[]>([]);
  const [activeItem, setActiveItem] = useState('R');
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [selectedDate, setSelectedDate] = useState(''); // Format: YYYY-MM-DD for the input
  const [showManualModal, setShowManualModal] = useState(false);
  const [visitors, setVisitors] = useState<number | null>(null);

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
          // If we don't have today's data yet, automatically fetch it in the background!
          fetch('/api/fetch-prices').then(() => {
            // Once fetched, reload the data to get the updated dataset
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
  }, []);

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

  if (loading) return <div style={{ color: 'white', padding: '2rem', textAlign: 'center' }}>Loading prediction engine...</div>;
  if (!data.length) return <div style={{ color: 'white' }}>No data found.</div>;

  const itemDef = ITEMS[activeItem as keyof typeof ITEMS];
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
    actionText = `Hold your crop! Prices are expected to peak at ₹${peakPrice.toLocaleString()} on ${futureLabels[peakIndex]}. Send your product to market then.`;
    actionType = 'wait';
  } else if (stats.slope < -100) {
    actionText = `Bearish market ahead. The price is dropping. It is highly recommended to sell immediately before prices fall further.`;
    actionType = 'sell';
  } else {
    actionText = `Prices are stable around ₹${latestAvg.toLocaleString()}. You can sell now or wait for minor fluctuations.`;
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
        label: 'Historical Avg',
        data: chartDataHist,
        borderColor: itemDef.color,
        backgroundColor: `${itemDef.color}33`,
        fill: true,
        tension: 0.3,
        pointRadius: 1,
      },
      {
        label: '7-Day Forecast',
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
      legend: { labels: { color: 'white' } },
    },
    scales: {
      x: { ticks: { color: '#94a3b8' }, grid: { display: false } },
      y: { ticks: { color: '#94a3b8' }, grid: { color: 'rgba(255, 255, 255, 0.05)' } }
    }
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.textGradient}>TSS Sirsi Smart Predictor</h1>
        <p>Advanced 7-Day Market Intelligence for Arecanut Farmers</p>
      </header>

      {/* Actionable Banner */}
      <div className={`${styles.actionBanner} ${styles[actionType] || ''}`}>
        {actionType === 'wait' ? <CalendarDays size={28} /> : actionType === 'sell' ? <AlertCircle size={28} /> : <CheckCircle size={28} />}
        <div>
          <div style={{ fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '1px', opacity: 0.8, marginBottom: '4px' }}>
            Actionable Insight for {itemDef.label}
          </div>
          {actionText}
        </div>
      </div>

      <div className={styles.grid}>
        {/* Sidebar */}
        <aside className={styles.sidebar}>
          <button className={styles.syncBtn} onClick={syncPrices} disabled={syncing}>
            <RefreshCw size={18} className={syncing ? 'spin' : ''} />
            {syncing ? 'Fetching...' : 'Fetch Napanta Rates'}
          </button>

          <button className={styles.syncBtn} onClick={() => setShowManualModal(true)} style={{ background: 'var(--accent-green)' }}>
            <Plus size={18} />
            Add Manual Entry
          </button>

          <div style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <h3 style={{ fontSize: '0.9rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '4px' }}>Commodity</h3>
            {Object.entries(ITEMS).map(([key, item]) => (
              <button
                key={key}
                className={`${styles.commodityBtn} ${activeItem === key ? styles.active : ''}`}
                onClick={() => setActiveItem(key)}
              >
                {item.emoji} {item.label}
              </button>
            ))}
          </div>

          <div style={{ marginTop: '2rem' }}>
            <h3 style={{ fontSize: '0.9rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Historical Date</h3>
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
              <div className={styles.kpiLabel}>Current Price</div>
              <div className={styles.kpiValue}>₹{latestAvg.toLocaleString()}</div>
              <div className={`${styles.kpiSub} ${isUp ? styles.up : styles.down}`}>
                {isUp ? <TrendingUp size={14} style={{ display: 'inline', verticalAlign: 'middle' }} /> : <TrendingDown size={14} style={{ display: 'inline', verticalAlign: 'middle' }} />}
                {' '}{Math.abs(Number(pctChange))}% vs yesterday
              </div>
            </div>
            <div className={`${styles.kpiCard} glass`}>
              <div className={styles.kpiLabel}>7-Day Peak Forecast</div>
              <div className={styles.kpiValue} style={{ color: 'var(--accent-amber)' }}>₹{peakPrice.toLocaleString()}</div>
              <div className={styles.kpiSub}>Expected on {futureLabels[peakIndex]}</div>
            </div>
            <div className={`${styles.kpiCard} glass`}>
              <div className={styles.kpiLabel}>Market Signal</div>
              <div className={styles.kpiValue} style={{ fontSize: '1.5rem', marginTop: '0.2rem' }}>
                {stats.slope > 50 ? 'Strong Bullish ↑' : stats.slope < -50 ? 'Bearish ↓' : 'Sideways →'}
              </div>
              <div className={styles.kpiSub}>Confidence: {stats.conf}%</div>
            </div>
          </div>

          {/* 7-Day Forecast Strip */}
          <div className={`${styles.chartCard} glass`} style={{ minHeight: 'auto' }}>
            <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>7-Day Detailed Forecast</h3>
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
              <div className={styles.chartTitle}>Price Trend & Projection</div>
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
              <div className={styles.chartTitle} style={{ fontSize: '1.1rem' }}>Market Rates for {selectedDate || 'Selected Date'}</div>
            </div>
            {(() => {
              const internalDate = parseToInternalDate(selectedDate);
              const dayData = data.find(d => d.d === internalDate);

              if (!dayData) {
                return <div style={{ color: 'var(--text-muted)', padding: '1rem', textAlign: 'center' }}>
                  No market data available for this date.
                </div>;
              }

              return (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {Object.entries(ITEMS).map(([key, item]) => (
                    <div key={key} className={styles.historyCard} style={{ background: 'var(--glass-bg)' }}>
                      <div className={styles.hCardHeader} style={{ color: item.color }}>
                        {item.emoji} {item.label}
                      </div>
                      <div className={styles.hRow}>
                        <span className={styles.hLabel}>Average</span>
                        <span className={styles.hVal}>₹{dayData[item.avgKey].toLocaleString()}</span>
                      </div>
                      <div className={styles.hRow}>
                        <span className={styles.hLabel}>Minimum</span>
                        <span className={styles.hVal} style={{ color: 'var(--accent-red)' }}>₹{dayData[item.minKey].toLocaleString()}</span>
                      </div>
                      <div className={styles.hRow}>
                        <span className={styles.hLabel}>Maximum</span>
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
              <h2 style={{ fontSize: '1.5rem' }}>Add Manual Market Rates</h2>
              <button onClick={() => setShowManualModal(false)} style={{ background: 'transparent', border: 'none', color: 'white', cursor: 'pointer', fontSize: '1.5rem' }}>×</button>
            </div>

            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>Date (DD-MM-YY)</label>
                <input
                  type="text"
                  value={manualData.d}
                  onChange={e => setManualData({ ...manualData, d: e.target.value })}
                  style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', color: 'white', padding: '0.75rem', borderRadius: '6px', width: '100%' }}
                />
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>Admin Secret Password</label>
                <input
                  type="password"
                  placeholder="Enter secret to allow save..."
                  value={manualData.secret}
                  onChange={e => setManualData({ ...manualData, secret: e.target.value })}
                  style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', color: 'white', padding: '0.75rem', borderRadius: '6px', width: '100%' }}
                />
              </div>
            </div>

            {Object.entries(ITEMS).map(([key, item]) => (
              <div key={key} style={{ marginBottom: '1.5rem', background: 'rgba(255,255,255,0.02)', padding: '1rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
                <h3 style={{ color: item.color, marginBottom: '1rem', fontSize: '1.1rem' }}>{item.emoji} {item.label}</h3>
                <div className={styles.formGrid}>
                  <div className={styles.formGroup}>
                    <label>Minimum Price</label>
                    <input type="number" onChange={e => setManualData({ ...manualData, [item.minKey]: parseInt(e.target.value) || 0 })} />
                  </div>
                  <div className={styles.formGroup}>
                    <label>Average Price</label>
                    <input type="number" onChange={e => setManualData({ ...manualData, [item.avgKey]: parseInt(e.target.value) || 0 })} />
                  </div>
                  <div className={styles.formGroup}>
                    <label>Maximum Price</label>
                    <input type="number" onChange={e => setManualData({ ...manualData, [item.maxKey]: parseInt(e.target.value) || 0 })} />
                  </div>
                </div>
              </div>
            ))}

            <div className={styles.modalActions}>
              <button className={styles.syncBtn} onClick={() => setShowManualModal(false)} style={{ background: 'rgba(255,255,255,0.1)' }}>Cancel</button>
              <button className={styles.syncBtn} onClick={handleManualSubmit} style={{ background: 'var(--accent-green)' }}>Save & Train Model</button>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer style={{ marginTop: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.5rem 0', borderTop: '1px solid rgba(255,255,255,0.05)', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
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

'use client';

import { useEffect, useState, useRef } from 'react';
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
import { TrendingUp, TrendingDown, AlertCircle, RefreshCw, CalendarDays, CheckCircle, Plus, Eye, Sun, Moon, Languages, Share2, Menu, Mail } from 'lucide-react';
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
    saveAndTrain: "Save & Train Model",
    disclaimerTitle: "Disclaimer:",
    disclaimerText: "Data Source: Verified daily market rates sourced directly from official TSS Sirsi WhatsApp updates. The 7-day market forecasts and actionable insights provided by TSS Sirsi Smart Predictor are generated using machine learning models based on historical APMC data. This is an independent analytical tool and is not officially affiliated with the Totgars' Cooperative Sale Society (TSS). They are for informational and educational purposes only and do not constitute financial advice. Agricultural markets are highly volatile and subject to sudden changes. We are not liable for any financial losses incurred based on these predictions. Always exercise your own independent judgment before making selling decisions.",
    awaitingData: "Awaiting today's rates...",
    poweredBy: "⚡ Powered by Twilio & AI extraction from live WhatsApp updates"
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
    saveAndTrain: "ಉಳಿಸಿ ಮತ್ತು ಮಾಡೆಲ್ ತರಬೇತಿ ನೀಡಿ",
    disclaimerTitle: "ಹಕ್ಕು ನಿರಾಕರಣೆ:",
    disclaimerText: "ಡೇಟಾ ಮೂಲ: ಅಧಿಕೃತ TSS ಶಿರಸಿ ವಾಟ್ಸಾಪ್ ಅಪ್‌ಡೇಟ್‌ಗಳಿಂದ ನೇರವಾಗಿ ಪಡೆಯಲಾದ ಪರಿಶೀಲಿಸಿದ ದೈನಂದಿನ ಮಾರುಕಟ್ಟೆ ದರಗಳು. TSS ಶಿರಸಿ ಸ್ಮಾರ್ಟ್ ಭವಿಷ್ಯ ಒದಗಿಸುವ 7-ದಿನದ ಮಾರುಕಟ್ಟೆ ಮುನ್ಸೂಚನೆಗಳು ಮತ್ತು ಒಳನೋಟಗಳನ್ನು ಐತಿಹಾಸಿಕ APMC ಡೇಟಾವನ್ನು ಆಧರಿಸಿದ ಮಷಿನ್ ಲರ್ನಿಂಗ್ ಮಾದರಿಗಳನ್ನು ಬಳಸಿ ರಚಿಸಲಾಗಿದೆ. ಇದು ಸ್ವತಂತ್ರ ವಿಶ್ಲೇಷಣಾತ್ಮಕ ಸಾಧನವಾಗಿದೆ ಮತ್ತು ತೋಟಗಾರ್ಸ್ ಕೋಆಪರೇಟಿವ್ ಸೇಲ್ ಸೊಸೈಟಿ (TSS) ನೊಂದಿಗೆ ಅಧಿಕೃತವಾಗಿ ಸಂಯೋಜಿತವಾಗಿಲ್ಲ. ಅವು ಮಾಹಿತಿ ಮತ್ತು ಶೈಕ್ಷಣಿಕ ಉದ್ದೇಶಗಳಿಗಾಗಿ ಮಾತ್ರ ಮತ್ತು ಆರ್ಥಿಕ ಸಲಹೆಯಲ್ಲ. ಕೃಷಿ ಮಾರುಕಟ್ಟೆಗಳು ಹೆಚ್ಚು ಅಸ್ಥಿರವಾಗಿರುತ್ತವೆ ಮತ್ತು ಹಠಾತ್ ಬದಲಾವಣೆಗಳಿಗೆ ಒಳಪಟ್ಟಿರುತ್ತವೆ. ಈ ಮುನ್ಸೂಚನೆಗಳ ಆಧಾರದ ಮೇಲೆ ಉಂಟಾದ ಯಾವುದೇ ಆರ್ಥಿಕ ನಷ್ಟಕ್ಕೆ ನಾವು ಜವಾಬ್ದಾರರಾಗಿರುವುದಿಲ್ಲ. ಮಾರಾಟದ ನಿರ್ಧಾರಗಳನ್ನು ತೆಗೆದುಕೊಳ್ಳುವ ಮೊದಲು ಯಾವಾಗಲೂ ನಿಮ್ಮ ಸ್ವಂತ ಸ್ವತಂತ್ರ ತೀರ್ಮಾನವನ್ನು ಬಳಸಿ.",
    awaitingData: "ಇಂದಿನ ದರಗಳಿಗಾಗಿ ಕಾಯಲಾಗುತ್ತಿದೆ...",
    poweredBy: "⚡ ಲೈವ್ ವಾಟ್ಸಾಪ್ ಅಪ್‌ಡೇಟ್‌ಗಳಿಂದ ಟ್ವಿಲಿಯೊ ಮತ್ತು AI ಡೇಟಾ ಹೊರತೆಗೆಯುವಿಕೆಯಿಂದ ನಡೆಸಲ್ಪಡುತ್ತಿದೆ"
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

  // PWA Install Prompt State
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstallPopup, setShowInstallPopup] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const chartScrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Auto-scroll the chart to the far right on mobile to always reveal the latest 7-day forecast
    const timeoutId = setTimeout(() => {
      if (chartScrollRef.current) {
        chartScrollRef.current.scrollLeft = chartScrollRef.current.scrollWidth;
      }
    }, 100); // slight delay to allow rendering
    return () => clearTimeout(timeoutId);
  }, [activeItem, data]);

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

      // Automatic Daily Fetch Check (Only after 6 PM when APMC data arrives)
      if (loadedData && loadedData.length > 0) {
        const lastEntry = loadedData[loadedData.length - 1];
        const today = new Date();
        const d = `${String(today.getDate()).padStart(2, '0')}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getFullYear()).slice(2)}`;
        const currentHour = today.getHours();

        // APMC WhatsApp updates usually arrive between 3 PM and 6 PM.
        if (lastEntry.d !== d && currentHour >= 15) {
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

    // PWA Install Event Listener
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      if (!localStorage.getItem('tss_install_dismissed')) {
        setShowInstallPopup(true);
      }
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
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

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    setShowInstallPopup(false);
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    console.log(`User ${outcome} the install prompt`);
    setDeferredPrompt(null);
  };

  const handleDismissInstall = () => {
    setShowInstallPopup(false);
    localStorage.setItem('tss_install_dismissed', 'true');
  };

  const scrollToRates = () => {
    document.getElementById('today-rates')?.scrollIntoView({ behavior: 'smooth' });
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

  if (loading) return <div style={{ color: 'var(--text-main)', padding: '2rem', textAlign: 'center' }}>Syncing live market data from Sirsi APMC...</div>;
  if (!data.length) return <div style={{ color: 'var(--text-main)' }}>No data found.</div>;

  let beautifulDate = '';
  if (selectedDate) {
    const d = new Date(selectedDate);
    beautifulDate = d.toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' });
  }
  const itemDef = ITEMS[activeItem as keyof typeof ITEMS];
  const itemLabel = t[activeItem as keyof typeof t];
  const avgs = data.map((d) => d[itemDef.avgKey] || 0);
  const labels = data.map((d) => d.d);

  const latestAvg = avgs[avgs.length - 1];
  const prevAvg = avgs[avgs.length - 2] || latestAvg;
  const pctChange = (((latestAvg - prevAvg) / prevAvg) * 100).toFixed(1);
  const latestDateRaw = labels[labels.length - 1] || '';
  const dParts = latestDateRaw.split('-');
  const formattedLatestDate = dParts.length === 3 ? `${dParts[0]}-${dParts[1]}-20${dParts[2]}` : latestDateRaw;
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

  const handleShare = async () => {
    const shareText = `*${t.title}*\n${itemLabel} ${t.currPrice}: ₹${latestAvg.toLocaleString()}\n\n${t.actionInsight} ${itemLabel}:\n_${actionText}_\n\nCheck live 7-day forecast here:`;
    const shareUrl = 'https://tss-price-predictor.vercel.app/';
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: t.title,
          text: shareText,
          url: shareUrl
        });
      } catch (err) {
        console.error('Error sharing:', err);
      }
    } else {
      window.open(`https://wa.me/?text=${encodeURIComponent(shareText + ' ' + shareUrl)}`, '_blank');
    }
  };

  return (
    <div className={styles.container}>
      {/* Top Bar for Toggles */}
      <div className={styles.stickyTopBar}>
        <button onClick={handleShare} style={{ background: 'rgba(16, 185, 129, 0.1)', color: 'var(--accent-green)', border: '1px solid var(--glass-border)', padding: '0.5rem 1rem', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: '600', fontSize: '0.9rem', backdropFilter: 'blur(12px)', marginRight: 'auto' }}>
          <Share2 size={18} /> Share Insights
        </button>
        <button onClick={toggleLang} style={{ background: 'rgba(128, 128, 128, 0.1)', color: 'var(--text-main)', border: '1px solid var(--glass-border)', padding: '0.5rem 1rem', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: '500', fontSize: '0.9rem', backdropFilter: 'blur(12px)' }}>
          <Languages size={18} /> {lang === 'en' ? 'ಕನ್ನಡ' : 'English'}
        </button>
        <button onClick={toggleTheme} style={{ background: 'rgba(128, 128, 128, 0.1)', color: 'var(--text-main)', border: '1px solid var(--glass-border)', padding: '0.5rem', width: '38px', height: '38px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(12px)' }}>
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        {/* Hamburger Menu */}
        <div style={{ position: 'relative' }}>
          <button onClick={() => setShowMenu(!showMenu)} style={{ background: 'rgba(128, 128, 128, 0.1)', color: 'var(--text-main)', border: '1px solid var(--glass-border)', padding: '0.5rem', width: '38px', height: '38px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(12px)' }}>
            <Menu size={18} />
          </button>
          
          {showMenu && (
            <div style={{ position: 'absolute', top: '110%', right: 0, background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', borderRadius: '12px', padding: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.25rem', minWidth: '200px', zIndex: 50, backdropFilter: 'blur(30px)', boxShadow: '0 10px 40px rgba(0,0,0,0.5)' }}>
               <button onClick={() => { syncPrices(); setShowMenu(false); }} className={styles.menuItem}>
                 <RefreshCw size={16} className={syncing ? 'spin' : ''} /> {syncing ? t.fetching : 'Force Sync API'}
               </button>
               <button onClick={() => { setShowManualModal(true); setShowMenu(false); }} className={styles.menuItem}>
                 <Plus size={16} /> Admin Manual Entry
               </button>
               <div style={{ height: '1px', background: 'var(--glass-border)', margin: '4px 0' }} />
               <a href="mailto:vishwa9483500835@gmail.com" className={styles.menuItem} style={{ textDecoration: 'none' }}>
                 <Mail size={16} /> Contact Developer
               </a>
            </div>
          )}
        </div>
      </div>

      <header className={styles.header}>
        <h1 className={styles.textGradient}>{t.title}</h1>
        <p>{t.subtitle}</p>
      </header>

      {/* Today's / Selected Date Prices for All Items (Moved to Top) */}
      <div id="today-rates" className={`${styles.chartCard} glass`} style={{ minHeight: 'auto', marginBottom: '2rem', background: 'var(--accent-blue-bg, rgba(59, 130, 246, 0.05))', borderColor: 'rgba(59, 130, 246, 0.2)' }}>
        <div className={styles.chartHeader} style={{ marginBottom: '1rem', flexWrap: 'wrap', gap: '1rem', alignItems: 'center' }}>
          <div className={styles.chartTitle} style={{ fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
            {t.marketRatesFor}
            <div style={{ position: 'relative', display: 'inline-block' }}>
              <div style={{ 
                padding: '0.5rem 0.75rem', 
                fontSize: '1rem', 
                background: 'rgba(255,255,255,0.1)', 
                border: '1px solid var(--glass-border)',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                cursor: 'pointer',
                fontWeight: 600
              }}>
                {beautifulDate} <CalendarDays size={18} opacity={0.8} />
              </div>
              <input 
                type="date" 
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                onClick={(e) => {
                  try {
                    if ('showPicker' in e.currentTarget) {
                      e.currentTarget.showPicker();
                    }
                  } catch (err) {}
                }}
                max={data.length > 0 ? parseToInputDate(data[data.length - 1].d) : undefined}
                min={data.length > 0 ? parseToInputDate(data[0].d) : undefined}
                style={{ 
                  position: 'absolute', 
                  top: 0, left: 0, right: 0, bottom: 0, 
                  opacity: 0, 
                  width: '100%', 
                  height: '100%', 
                  cursor: 'pointer' 
                }}
              />
            </div>
            
            {/* Subtle Awaiting Data Indicator */}
            {data.length > 0 && selectedDate === parseToInputDate(data[data.length - 1].d) && (
              (() => {
                const d = new Date();
                const todayLocalStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
                return selectedDate !== todayLocalStr ? (
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontStyle: 'italic', marginLeft: '0.5rem', opacity: 0.8 }}>
                    * {t.awaitingData}
                  </span>
                ) : null;
              })()
            )}
          </div>
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
            <div className={styles.historyGrid}>
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

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
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


        </aside>

        {/* Main Content */}
        <main className={styles.mainContent}>

          {/* KPI Grid */}
          <div className={styles.kpiGrid}>
            <div className={`${styles.kpiCard} glass`}>
              <div className={styles.kpiLabel}>{t.currPrice} ({formattedLatestDate})</div>
              <div className={styles.kpiValue}>₹{latestAvg.toLocaleString()}</div>
              <div className={`${styles.kpiSub} ${isUp ? styles.up : styles.down}`}>
                {isUp ? <TrendingUp size={14} style={{ display: 'inline', verticalAlign: 'middle' }} /> : <TrendingDown size={14} style={{ display: 'inline', verticalAlign: 'middle' }} />}
                {' '}{Math.abs(Number(pctChange))}% {t.vsYest} (₹{prevAvg.toLocaleString()})
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
          <div className={`${styles.chartCard} glass`} style={{ paddingBottom: '0.5rem' }}>
            <div className={styles.chartHeader}>
              <div className={styles.chartTitle}>{t.trendProj}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span className="mobile-only-text">← Swipe for history</span>
              </div>
            </div>
            {/* Scrollable Container for Mobile */}
            <div ref={chartScrollRef} style={{ width: '100%', overflowX: 'auto', WebkitOverflowScrolling: 'touch', paddingBottom: '1rem', scrollBehavior: 'smooth' }}>
              <div style={{ minWidth: '800px', height: '300px', position: 'relative' }}>
                <Line data={chartData} options={chartOptions as any} />
              </div>
            </div>
          </div>
        </main>

      </div>

      {showManualModal && (
        <div className={styles.modalOverlay} onClick={() => setShowManualModal(false)}>
          <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
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
      <footer style={{ marginTop: '3rem', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: '2rem 0', borderTop: '1px solid var(--glass-border)', color: 'var(--text-muted)', gap: '1.25rem' }}>
        {visitors !== null ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(128, 128, 128, 0.1)', color: 'var(--text-main)', border: '1px solid var(--glass-border)', padding: '0.5rem 1rem', borderRadius: '12px', fontWeight: '500', backdropFilter: 'blur(12px)', fontSize: '0.9rem' }}>
            <Eye size={18} />
            {visitors} Visitors
          </div>
        ) : null}
        
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 600, color: 'var(--text-main)', fontSize: '1.05rem', letterSpacing: '0.02em' }}>
            Made with <span className="heartBeat" style={{ color: '#ef4444', display: 'inline-block', fontSize: '1.2rem' }}>❤️</span> By Vishwa
          </span>
          <span style={{ fontSize: '0.85rem', opacity: 0.7 }}>© {new Date().getFullYear()} TSS Price Predictor</span>
          <span style={{ fontSize: '0.8rem', color: 'var(--accent-green)', fontWeight: 500, marginTop: '0.25rem', textAlign: 'center', padding: '0 1rem' }}>
            {t.poweredBy}
          </span>
        </div>
        
        {/* Disclaimer Text */}
        <div style={{
          marginTop: '1.5rem',
          textAlign: 'center',
          color: 'var(--text-muted)',
          fontSize: '0.75rem',
          lineHeight: '1.6',
          opacity: 0.7,
          maxWidth: '1200px',
          padding: '0 1rem'
        }}>
          <p style={{ margin: 0 }}>
            <strong>{t.disclaimerTitle}</strong> {t.disclaimerText}
          </p>
        </div>
      </footer>

      {/* PWA Install Popup */}
      {showInstallPopup && (
        <div style={{
          position: 'fixed',
          bottom: '20px',
          left: '50%',
          transform: 'translateX(-50%)',
          background: 'var(--glass-bg)',
          border: '1px solid var(--accent-green)',
          padding: '1.25rem',
          borderRadius: '16px',
          boxShadow: '0 10px 40px rgba(0,0,0,0.5)',
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem',
          zIndex: 9999,
          width: '90%',
          maxWidth: '380px',
          backdropFilter: 'blur(20px)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ margin: 0, fontSize: '1.1rem', color: 'var(--text-main)' }}>Install TSS Predictor</h3>
            <button onClick={handleDismissInstall} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '1.5rem', lineHeight: '1rem' }}>×</button>
          </div>
          <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: '1.4' }}>Add this app to your home screen for quick, one-tap access to daily market rates and AI forecasts.</p>
          <button onClick={handleInstallClick} style={{ background: 'var(--accent-green)', color: 'white', border: 'none', padding: '0.85rem', borderRadius: '10px', fontWeight: '700', cursor: 'pointer', fontSize: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginTop: '0.5rem' }}>
            <Plus size={20} /> Add to Home Screen
          </button>
        </div>
      )}


      <style jsx global>{`
        .spin { animation: spin 1s linear infinite; }
        @keyframes spin { 100% { transform: rotate(360deg); } }
        
        .heartBeat { animation: heartBeat 1.5s infinite cubic-bezier(0.215, 0.61, 0.355, 1); }
        @keyframes heartBeat {
          0% { transform: scale(1); }
          15% { transform: scale(1.3); }
          30% { transform: scale(1); }
          45% { transform: scale(1.3); }
          60% { transform: scale(1); }
        }
      `}</style>
    </div>
  );
}

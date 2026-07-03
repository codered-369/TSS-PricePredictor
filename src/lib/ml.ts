export function wma(arr: number[], n: number) {
  if (!arr.length) return 0;
  n = Math.min(n, arr.length);
  const s = arr.slice(-n);
  let ws = 0, wt = 0;
  s.forEach((v, i) => {
    const w = i + 1;
    ws += v * w;
    wt += w;
  });
  return ws / wt;
}

export function sma(arr: number[], n: number) {
  n = Math.min(n, arr.length);
  if (n === 0) return 0;
  return arr.slice(-n).reduce((a, b) => a + b, 0) / n;
}

export function ewm(arr: number[], alpha = 0.3) {
  if (!arr.length) return 0;
  let v = arr[0];
  for (let i = 1; i < arr.length; i++) {
    v = alpha * arr[i] + (1 - alpha) * v;
  }
  return v;
}

export function linReg(arr: number[]) {
  const n = arr.length;
  if (n < 2) return { slope: 0, pred: (x: number) => arr[arr.length - 1] || 0 };
  let sx = 0, sy = 0, sxy = 0, sx2 = 0;
  arr.forEach((y, x) => {
    sx += x;
    sy += y;
    sxy += x * y;
    sx2 += x * x;
  });
  const sl = (n * sxy - sx * sy) / (n * sx2 - sx * sx) || 0;
  const ic = (sy - sl * sx) / n;
  return { slope: sl, pred: (x: number) => sl * x + ic };
}

export function stdDev(arr: number[]) {
  if (arr.length < 2) return 0;
  const m = arr.reduce((a, b) => a + b, 0) / arr.length;
  return Math.sqrt(arr.reduce((s, v) => s + Math.pow(v - m, 2), 0) / arr.length);
}

// Predict next 7 days
export function predict7(avgs: number[]) {
  if (avgs.length < 3) return Array(7).fill(avgs[avgs.length - 1] || 0);
  const sliceLen = Math.min(30, avgs.length);
  const reg = linReg(avgs.slice(-sliceLen));
  
  const last = avgs[avgs.length - 1];
  const prev = avgs[avgs.length - 2] || last;
  const pctChange = prev > 0 ? Math.abs((last - prev) / prev) : 0;
  
  // Dynamic Alpha: If high volatility (>5% move), react faster to recent price. Else, smooth trending.
  const alpha = pctChange > 0.05 ? 0.7 : 0.3;
  const ewmV = ewm(avgs, alpha);
  const wmaV = wma(avgs, 7);

  // Dynamic Ensemble Weights
  let w_wma = 0.40, w_reg = 0.35, w_ewm = 0.25;
  if (pctChange > 0.05) {
    // Structural break detected (crash/spike). Heavily weigh the fast EWM to avoid lagging.
    w_wma = 0.10; w_reg = 0.10; w_ewm = 0.80;
  }

  return Array.from({ length: 7 }, (_, i) => {
    // Damped Trend: Prevents linear regression from forecasting absurd numbers by slowly pulling it back to the last known price.
    const trendDampener = Math.pow(0.85, i); 
    const regPred = reg.pred(sliceLen + i);
    const projection = wmaV * w_wma + regPred * w_reg + ewmV * w_ewm;
    return Math.round(projection * trendDampener + last * (1 - trendDampener));
  });
}

// Predict T+1 with detailed stats
export function predictStats(avgs: number[], ahead = 1) {
  if (avgs.length < 3) return { pred: avgs.slice(-1)[0] || 0, std: 0, ma7: 0, ma14: 0, slope: 0, conf: 60 };
  const sliceLen = Math.min(30, avgs.length);
  const reg = linReg(avgs.slice(-sliceLen));
  
  const last = avgs[avgs.length - 1];
  const prev = avgs[avgs.length - 2] || last;
  const pctChange = prev > 0 ? Math.abs((last - prev) / prev) : 0;
  
  const alpha = pctChange > 0.05 ? 0.7 : 0.3;
  const ewmV = ewm(avgs, alpha);
  const wmaV = wma(avgs, 7);
  const smaV = sma(avgs, 14);

  let w_wma = 0.40, w_reg = 0.35, w_ewm = 0.25;
  if (pctChange > 0.05) {
    w_wma = 0.10; w_reg = 0.10; w_ewm = 0.80;
  }

  const regPred = reg.pred(sliceLen - 1 + ahead);
  const projection = wmaV * w_wma + regPred * w_reg + ewmV * w_ewm;
  const trendDampener = Math.pow(0.85, ahead - 1);
  const ens = projection * trendDampener + last * (1 - trendDampener);
  
  const s = stdDev(avgs.slice(-14));
  // Confidence drops by 20% if there is extreme recent volatility (harder to predict)
  const volPenalty = pctChange > 0.05 ? 20 : 0;
  const conf = Math.max(50, Math.min(95, 68 + Math.floor(avgs.length / 4) - volPenalty));
  
  return { pred: Math.round(ens), std: Math.round(s), ma7: Math.round(wmaV), ma14: Math.round(smaV), slope: reg.slope, conf };
}

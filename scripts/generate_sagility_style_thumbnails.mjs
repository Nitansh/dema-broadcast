import fs from 'fs';
import path from 'path';

const puppeteerModule = 'file:///C:/Users/T0263544/AppData/Local/Programs/Antigravity/resources/app.asar.unpacked/node_modules/chrome-devtools-mcp/build/src/third_party/index.js';
const { puppeteer } = await import(puppeteerModule);

const WORKSPACE = path.resolve('c:/VideoGen/web motion/claude/Thales');
const ARTIFACT_DIR = path.resolve('C:/Users/T0263544/.gemini/antigravity/brain/5c1716f0-9208-4e85-937f-49a7d35ae8c3');

const STOCKS = [
  {
    symbol: 'SUNPHARMA',
    headline: 'SUN PHARMA 20 DEMA BREAKOUT',
    subtitle: 'Breakout Hold या Target ₹1,940?',
    chartFile: path.join(WORKSPACE, 'modi-remotion/public/charts/SUNPHARMA_1D_chart.png'),
    expansionTarget: '₹1,940.00',
    step1: { y: 720, label: 'ACCUMULATION', price: '₹1,863 - ₹1,879' },
    step2: { y: 560, label: '20 DEMA CUSHION', price: '₹1,879.02' },
    step3: { y: 380, label: 'CMP ₹1,884.90', price: 'VAH BREAKOUT' },
    matrixTitle: '▲ RESISTANCE & TARGETS (ABOVE CMP)',
    matrixRows: [
      { label: 'TARGET 2 (Expansion)', val: '₹1,940.00', color: '#06b6d4' },
      { label: '✓ TARGET 1 (VAH)', val: '₹1,901.43', color: '#06b6d4' },
      { label: '✓ CMP CURRENT PIVOT', val: '₹1,884.90', color: '#10b981' },
      { label: '✓ POC (Point of Control)', val: '₹1,884.90', color: '#d4b064' },
      { label: '20 DEMA (Cushion)', val: '₹1,879.02', color: '#f2cf1d' },
      { label: '100 DEMA (Support)', val: '₹1,875.12', color: '#ef4444' },
      { label: '200 DEMA (Macro)', val: '₹1,872.48', color: '#ef4444' },
      { label: '50 DEMA (Floor)', val: '₹1,863.63', color: '#ef4444' },
      { label: 'VAL (Value Area Low)', val: '₹1,842.10', color: '#ef4444' },
    ]
  },
  {
    symbol: 'TRENT',
    headline: 'TRENT 50 DEMA BLAST',
    subtitle: 'Breakout Hold या Target ₹3,480?',
    chartFile: path.join(WORKSPACE, 'modi-remotion/public/charts/TRENT_1D_chart.png'),
    expansionTarget: '₹3,480.00',
    step1: { y: 680, label: 'ACCUMULATION', price: '₹2,792 - ₹3,024' },
    step2: { y: 510, label: '20/50 DEMA RECLAIM', price: '₹3,236.09' },
    step3: { y: 340, label: 'CMP ₹3,256.10', price: 'VAH BREAKOUT' },
    matrixTitle: '▲ RESISTANCE & TARGETS (ABOVE CMP)',
    matrixRows: [
      { label: 'TARGET 2 (Expansion)', val: '₹3,480.00', color: '#06b6d4' },
      { label: 'TARGET 1 (Corridor)', val: '₹3,350.00', color: '#06b6d4' },
      { label: '✓ CMP / VAH BREAKOUT', val: '₹3,256.10', color: '#10b981' },
      { label: '20 DEMA (Cushion)', val: '₹3,236.09', color: '#f2cf1d' },
      { label: '50 DEMA (Floor)', val: '₹3,087.94', color: '#f2cf1d' },
      { label: 'POC (Point of Control)', val: '₹3,024.38', color: '#d4b064' },
      { label: '100 DEMA (Macro)', val: '₹2,986.68', color: '#ef4444' },
      { label: '200 DEMA (Base)', val: '₹2,872.78', color: '#ef4444' },
      { label: 'VAL (Value Area Low)', val: '₹2,792.66', color: '#ef4444' },
    ]
  },
  {
    symbol: 'TVSMOTOR',
    headline: 'TVS MOTOR ₹4,590 BREAKOUT',
    subtitle: 'Breakout Hold या Target ₹4,850?',
    chartFile: path.join(WORKSPACE, 'modi-remotion/public/charts/TVSMOTOR_1D_chart.png'),
    expansionTarget: '₹4,850.00',
    step1: { y: 690, label: 'ACCUMULATION', price: '₹3,946 - ₹4,447' },
    step2: { y: 510, label: '20 DEMA RECLAIM', price: '₹4,555.41' },
    step3: { y: 340, label: 'CMP ₹4,590.00', price: 'VAH BREAKOUT' },
    matrixTitle: '▲ RESISTANCE & TARGETS (ABOVE CMP)',
    matrixRows: [
      { label: 'TARGET 2 (Expansion)', val: '₹4,850.00', color: '#06b6d4' },
      { label: 'TARGET 1 (Corridor)', val: '₹4,720.00', color: '#06b6d4' },
      { label: '✓ CMP / VAH BREAKOUT', val: '₹4,590.00', color: '#10b981' },
      { label: '20 DEMA (Cushion)', val: '₹4,555.41', color: '#f2cf1d' },
      { label: 'POC (Point of Control)', val: '₹4,447.02', color: '#d4b064' },
      { label: '50 DEMA (Floor)', val: '₹4,418.58', color: '#f2cf1d' },
      { label: '100 DEMA (Trend)', val: '₹4,346.11', color: '#ef4444' },
      { label: '200 DEMA (Macro)', val: '₹4,210.45', color: '#ef4444' },
      { label: 'VAL (Value Area Low)', val: '₹3,946.59', color: '#ef4444' },
    ]
  },
  {
    symbol: 'AXISBANK',
    headline: 'AXIS BANK ₹1,446 MEGA SURGE',
    subtitle: 'Breakout Hold या Target ₹1,550?',
    chartFile: path.join(WORKSPACE, 'modi-remotion/public/charts/AXISBANK_1D_chart.png'),
    expansionTarget: '₹1,550.00',
    step1: { y: 700, label: 'ACCUMULATION', price: '₹1,197 - ₹1,221' },
    step2: { y: 500, label: '20 DEMA RECLAIM', price: '₹1,385.05' },
    step3: { y: 330, label: 'CMP ₹1,446.00', price: 'VAH BREAKOUT' },
    matrixTitle: '▲ RESISTANCE & TARGETS (ABOVE CMP)',
    matrixRows: [
      { label: 'TARGET 2 (Expansion)', val: '₹1,550.00', color: '#06b6d4' },
      { label: 'TARGET 1 (Corridor)', val: '₹1,490.00', color: '#06b6d4' },
      { label: '✓ CMP / VAH BREAKOUT', val: '₹1,446.00', color: '#10b981' },
      { label: '20 DEMA (Cushion)', val: '₹1,385.05', color: '#f2cf1d' },
      { label: '50 DEMA (Floor)', val: '₹1,314.46', color: '#f2cf1d' },
      { label: '100 DEMA (Support)', val: '₹1,279.18', color: '#ef4444' },
      { label: '200 DEMA (Macro)', val: '₹1,271.65', color: '#ef4444' },
      { label: 'POC (Point of Control)', val: '₹1,221.90', color: '#d4b064' },
      { label: 'VAL (Value Area Low)', val: '₹1,197.00', color: '#ef4444' },
    ]
  }
];

function buildHTML(cfg) {
  const chartBase64 = fs.existsSync(cfg.chartFile)
    ? `data:image/png;base64,${fs.readFileSync(cfg.chartFile).toString('base64')}`
    : '';

  const rowsHtml = cfg.matrixRows.map(r => `
    <div class="matrix-row">
      <span class="row-label" style="${r.color ? `color: ${r.color};` : ''}">${r.label}</span>
      <span class="row-val" style="color: ${r.color || '#fff'};">${r.val}</span>
    </div>
  `).join('');

  const s1 = cfg.step1;
  const s2 = cfg.step2;
  const s3 = cfg.step3;

  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    width: 1920px;
    height: 1080px;
    overflow: hidden;
    position: relative;
    background-color: #0b0f19;
    font-family: 'Segoe UI', system-ui, sans-serif;
    color: #fff;
  }

  /* Background Chart */
  .chart-bg {
    position: absolute;
    right: 0;
    top: 0;
    width: 1450px;
    height: 1080px;
    background-image: url('${chartBase64}');
    background-size: contain;
    background-repeat: no-repeat;
    background-position: right center;
    opacity: 0.95;
    z-index: 1;
  }

  /* Left Dark Gradient Overlay for legibility */
  .vignette-left {
    position: absolute;
    left: 0;
    top: 0;
    width: 1100px;
    height: 1080px;
    background: linear-gradient(90deg, #0b0f19 0%, #0b0f19 38%, rgba(11, 15, 25, 0.88) 55%, rgba(11, 15, 25, 0.35) 75%, transparent 100%);
    z-index: 2;
  }

  /* Content Wrapper */
  .content {
    position: absolute;
    inset: 0;
    z-index: 3;
    padding: 50px 60px;
  }

  /* Header Branding */
  .brand-row {
    display: flex;
    align-items: center;
    gap: 16px;
  }
  .logo-box {
    width: 44px;
    height: 44px;
    background: #f2cf1d;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: 'Impact', 'Arial Black', sans-serif;
    font-size: 32px;
    font-weight: 900;
    color: #000;
  }
  .brand-title {
    font-family: 'Impact', 'Arial Black', sans-serif;
    font-size: 32px;
    font-weight: 800;
    letter-spacing: 1.5px;
    color: #fff;
  }
  .pill-tag {
    background: #ef4444;
    color: #fff;
    padding: 6px 16px;
    border-radius: 6px;
    font-size: 18px;
    font-weight: 800;
    letter-spacing: 1px;
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .pill-dot {
    width: 8px;
    height: 8px;
    background: #fff;
    border-radius: 50%;
  }

  /* Main Headline */
  .headline-container {
    margin-top: 80px;
  }
  .main-headline {
    font-family: 'Impact', 'Arial Black', sans-serif;
    font-size: 100px;
    font-weight: 900;
    line-height: 0.95;
    letter-spacing: 2px;
    text-transform: uppercase;
    color: #ffffff;
    text-shadow: 0 4px 20px rgba(0,0,0,0.85);
    white-space: nowrap;
  }
  .sub-headline {
    margin-top: 14px;
    font-family: 'Nirmala UI', 'Segoe UI', sans-serif;
    font-size: 56px;
    font-weight: 700;
    color: #d4b064;
    text-shadow: 0 3px 15px rgba(0,0,0,0.85);
  }

  /* Telemetry Matrix Card */
  .telemetry-card {
    position: absolute;
    left: 60px;
    bottom: 95px;
    width: 480px;
    background: rgba(14, 18, 28, 0.94);
    border: 1px solid rgba(75, 85, 99, 0.45);
    border-radius: 12px;
    padding: 18px 24px;
    box-shadow: 0 16px 36px rgba(0,0,0,0.8);
  }
  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 10px;
  }
  .card-title {
    font-family: 'Impact', 'Arial Black', sans-serif;
    font-size: 20px;
    font-weight: 800;
    letter-spacing: 1px;
    color: #f2cf1d;
  }
  .card-study {
    font-family: 'Consolas', monospace;
    font-size: 13px;
    color: #9ca3af;
  }
  .matrix-section-title {
    font-size: 11px;
    font-weight: 700;
    color: #ef4444;
    margin-bottom: 8px;
    letter-spacing: 0.5px;
  }
  .matrix-table {
    width: 100%;
    border-collapse: collapse;
  }
  .matrix-row {
    border-bottom: 1px solid rgba(55, 65, 81, 0.4);
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 5px 0;
    font-family: 'Consolas', monospace;
    font-size: 13.5px;
  }
  .matrix-row:last-child {
    border-bottom: none;
  }
  .row-label {
    color: #d1d5db;
    display: flex;
    align-items: center;
    gap: 6px;
  }
  .row-val {
    font-weight: 700;
  }

  /* Disclaimer Bar */
  .disclaimer-bar {
    position: absolute;
    left: 60px;
    bottom: 35px;
    border: 1px solid rgba(212, 176, 100, 0.35);
    border-radius: 6px;
    padding: 8px 18px;
    font-family: 'Consolas', monospace;
    font-size: 13px;
    color: #d4b064;
    background: rgba(11, 15, 25, 0.85);
  }

  /* Overlay Staircase & Targets */
  .staircase-svg {
    position: absolute;
    right: 0;
    top: 0;
    width: 1920px;
    height: 1080px;
    z-index: 4;
    pointer-events: none;
  }

  .target-badge-box {
    position: absolute;
    right: 60px;
    top: 60px;
    border: 3px solid #06b6d4;
    background: rgba(6, 182, 212, 0.12);
    box-shadow: 0 0 28px rgba(6, 182, 212, 0.6), inset 0 0 15px rgba(6, 182, 212, 0.25);
    border-radius: 12px;
    padding: 12px 28px;
    text-align: center;
    z-index: 5;
  }
  .target-badge-title {
    font-family: 'Impact', 'Arial Black', sans-serif;
    font-size: 20px;
    font-weight: 800;
    letter-spacing: 1.5px;
    color: #38bdf8;
  }
  .target-badge-price {
    font-family: 'Impact', 'Arial Black', sans-serif;
    font-size: 42px;
    font-weight: 900;
    color: #ffffff;
    line-height: 1.1;
  }
</style>
</head>
<body>

  <!-- Background Chart -->
  <div class="chart-bg"></div>

  <!-- Left Dark Gradient -->
  <div class="vignette-left"></div>

  <!-- Main Content -->
  <div class="content">
    <div class="brand-row">
      <div class="logo-box">D</div>
      <div class="brand-title">DEMA ANALYSIS</div>
      <div class="pill-tag">
        <div class="pill-dot"></div>
        DAILY STUDY PACK · 2026
      </div>
    </div>

    <div class="headline-container">
      <div class="main-headline">${cfg.headline}</div>
      <div class="sub-headline">${cfg.subtitle}</div>
    </div>

    <div class="telemetry-card">
      <div class="card-header">
        <span class="card-title">TELEMETRY MATRIX</span>
        <span class="card-study">1D STUDY</span>
      </div>
      <div class="matrix-section-title">${cfg.matrixTitle}</div>
      <div class="matrix-table">
        ${rowsHtml}
      </div>
    </div>

    <div class="disclaimer-bar">
      STRICTLY EDUCATIONAL TECHNICAL STUDY · NO SEBI ADVISORY CLAIMS
    </div>
  </div>

  <!-- Top Right Expansion Target Box -->
  <div class="target-badge-box">
    <div class="target-badge-title">EXPANSION TARGET</div>
    <div class="target-badge-price">${cfg.expansionTarget}</div>
  </div>

  <!-- Staircase Overlay & Arrows -->
  <svg class="staircase-svg" viewBox="0 0 1920 1080">
    <defs>
      <filter id="glow-green" x="-20%" y="-20%" width="140%" height="140%">
        <feGaussianBlur stdDeviation="6" result="blur" />
        <feMerge>
          <feMergeNode in="blur" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>
      <filter id="glow-orange" x="-20%" y="-20%" width="140%" height="140%">
        <feGaussianBlur stdDeviation="6" result="blur" />
        <feMerge>
          <feMergeNode in="blur" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>
      <filter id="glow-yellow" x="-20%" y="-20%" width="140%" height="140%">
        <feGaussianBlur stdDeviation="6" result="blur" />
        <feMerge>
          <feMergeNode in="blur" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>
      <filter id="glow-cyan" x="-20%" y="-20%" width="140%" height="140%">
        <feGaussianBlur stdDeviation="7" result="blur" />
        <feMerge>
          <feMergeNode in="blur" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>
    </defs>

    <!-- Step 1: Accumulation (Orange) -->
    <path d="M 940 ${s1.y + 60} L 940 ${s1.y} L 1220 ${s1.y}" fill="none" stroke="#f59e0b" stroke-width="7" filter="url(#glow-orange)" />
    <text x="990" y="${s1.y + 46}" fill="#f59e0b" font-family="'Impact', 'Arial Black', sans-serif" font-size="28" font-weight="900" letter-spacing="1">${s1.label}</text>
    <text x="990" y="${s1.y + 84}" fill="#f59e0b" font-family="'Impact', 'Arial Black', sans-serif" font-size="34" font-weight="900">${s1.price}</text>

    <!-- Step 2: Intermediate Cushion/Reclaim (Yellow) -->
    <path d="M 1220 ${s1.y} L 1220 ${s2.y} L 1400 ${s2.y}" fill="none" stroke="#f2cf1d" stroke-width="7" filter="url(#glow-yellow)" />
    <text x="1230" y="${s2.y + 46}" fill="#f2cf1d" font-family="'Impact', 'Arial Black', sans-serif" font-size="28" font-weight="900" letter-spacing="1">${s2.label}</text>
    <text x="1230" y="${s2.y + 84}" fill="#f2cf1d" font-family="'Impact', 'Arial Black', sans-serif" font-size="34" font-weight="900">${s2.price}</text>

    <!-- Step 3: CMP VAH Breakout (Neon Green) -->
    <path d="M 1400 ${s2.y} L 1400 ${s3.y} L 1750 ${s3.y}" fill="none" stroke="#10b981" stroke-width="8" filter="url(#glow-green)" />
    <text x="1500" y="${s3.y + 68}" fill="#10b981" font-family="'Impact', 'Arial Black', sans-serif" font-size="32" font-weight="900" letter-spacing="1">${s3.label}</text>
    <text x="1500" y="${s3.y + 108}" fill="#10b981" font-family="'Impact', 'Arial Black', sans-serif" font-size="36" font-weight="900" letter-spacing="1">${s3.price}</text>

    <!-- Upward Filled Cyan Arrow to Expansion Target -->
    <polygon points="1710,180 1742,230 1724,230 1724,${s3.y} 1696,${s3.y} 1696,230 1678,230" fill="#38bdf8" filter="url(#glow-cyan)" />
  </svg>

</body>
</html>`;
}

async function main() {
  const browser = await puppeteer.launch({
    headless: 'new',
    executablePath: 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1920,1080']
  });

  try {
    const page = await browser.newPage();
    page.setDefaultTimeout(0);
    page.setDefaultNavigationTimeout(0);
    await page.setViewport({ width: 1920, height: 1080, deviceScaleFactor: 1 });

    for (const cfg of STOCKS) {
      console.log(`\n[THUMBNAIL] Generating Sagility-style thumbnail for ${cfg.symbol}...`);
      const html = buildHTML(cfg);
      await page.setContent(html, { waitUntil: 'domcontentloaded', timeout: 15000 });
      await new Promise(r => setTimeout(r, 600));

      const symLower = cfg.symbol.toLowerCase();
      const outRoot = path.join(WORKSPACE, `${symLower}-youtube-16x9-thumbnail.jpg`);
      const outArtifact = path.join(ARTIFACT_DIR, `${symLower}-youtube-16x9-thumbnail.jpg`);
      const outSuite = path.join(WORKSPACE, `DEMA_Daily_Suite_20261113/02_Thumbnails/${cfg.symbol}_YouTube_16x9_thumb.jpg`);

      await page.screenshot({ path: outRoot, type: 'jpeg', quality: 95 });
      fs.copyFileSync(outRoot, outArtifact);
      
      const suiteDir = path.dirname(outSuite);
      if (!fs.existsSync(suiteDir)) fs.mkdirSync(suiteDir, { recursive: true });
      fs.copyFileSync(outRoot, outSuite);

      console.log(`  [OK] Saved root:     ${outRoot}`);
      console.log(`  [OK] Saved artifact: ${outArtifact}`);
      console.log(`  [OK] Saved suite:    ${outSuite}`);
    }

    console.log(`\n[ALL COMPLETE] All 4 thumbnails successfully generated in Sagility format!`);
  } finally {
    await browser.close();
  }
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});

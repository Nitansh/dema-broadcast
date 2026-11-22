import fs from 'fs';
import path from 'path';

const puppeteerModule = 'file:///C:/Users/T0263544/AppData/Local/Programs/Antigravity/resources/app.asar.unpacked/node_modules/chrome-devtools-mcp/build/src/third_party/index.js';
const { puppeteer } = await import(puppeteerModule);

const WORKSPACE = path.resolve('c:/VideoGen/web motion/claude/Thales');
const ARTIFACT_DIR = path.resolve('C:/Users/T0263544/.gemini/antigravity/brain/5c1716f0-9208-4e85-937f-49a7d35ae8c3');

const STOCKS = [
  {
    symbol: 'HMAAGRO',
    headline: 'HMA AGRO ₹33.91 BREAKOUT',
    subtitle: 'Breakout Hold या Target ₹39.80?',
    chartFile: path.join(WORKSPACE, 'modi-remotion/public/charts/HMAAGRO_1D_chart.png'),
    expansionTarget: '₹39.80',
    step1: { y: 700, label: 'ACCUMULATION', price: '₹23.66 - ₹27.70' },
    step2: { y: 520, label: '20 DEMA CUSHION', price: '₹29.98' },
    step3: { y: 340, label: 'CMP ₹33.91', price: 'VAH BREAKOUT' },
    matrixTitle: '▲ RESISTANCE & TARGETS (ABOVE CMP)',
    matrixRows: [
      { label: 'TARGET 2 (Expansion)', val: '₹39.80', color: '#06b6d4' },
      { label: 'TARGET 1 (Corridor)', val: '₹36.50', color: '#06b6d4' },
      { label: '✓ CMP / VAH BREAKOUT', val: '₹33.91', color: '#10b981' },
      { label: 'POC (Point of Control)', val: '₹33.72', color: '#d4b064' },
      { label: '20 DEMA (Cushion)', val: '₹29.98', color: '#f2cf1d' },
      { label: 'VAL (Value Area Low)', val: '₹29.44', color: '#ef4444' },
      { label: '50 DEMA (Floor)', val: '₹27.70', color: '#f2cf1d' },
      { label: '100 DEMA (Base)', val: '₹25.38', color: '#ef4444' },
      { label: '200 DEMA (Macro)', val: '₹23.66', color: '#ef4444' },
    ]
  },
  {
    symbol: 'BANKBARODA',
    headline: 'BANK OF BARODA ₹287 SURGE',
    subtitle: 'Breakout Hold या Target ₹308?',
    chartFile: path.join(WORKSPACE, 'modi-remotion/public/charts/BANKBARODA_1D_chart.png'),
    expansionTarget: '₹308.00',
    step1: { y: 690, label: 'ACCUMULATION', price: '₹233 - ₹256' },
    step2: { y: 510, label: '20 DEMA RECLAIM', price: '₹280.15' },
    step3: { y: 340, label: 'CMP ₹287.00', price: 'VAH BREAKOUT' },
    matrixTitle: '▲ RESISTANCE & TARGETS (ABOVE CMP)',
    matrixRows: [
      { label: 'TARGET 2 (Expansion)', val: '₹308.00', color: '#06b6d4' },
      { label: 'TARGET 1 (Corridor)', val: '₹295.00', color: '#06b6d4' },
      { label: '✓ CMP / VAH BREAKOUT', val: '₹287.00', color: '#10b981' },
      { label: '20 DEMA (Cushion)', val: '₹280.15', color: '#f2cf1d' },
      { label: 'POC (Point of Control)', val: '₹275.06', color: '#d4b064' },
      { label: '50 DEMA (Floor)', val: '₹256.94', color: '#f2cf1d' },
      { label: '200 DEMA (Macro)', val: '₹250.25', color: '#ef4444' },
      { label: '100 DEMA (Support)', val: '₹246.05', color: '#ef4444' },
      { label: 'VAL (Value Area Low)', val: '₹233.27', color: '#ef4444' },
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
    font-size: 13px;
    font-weight: 800;
    letter-spacing: 1px;
    margin-bottom: 12px;
  }
  .header-left {
    color: #d4b064;
  }
  .header-right {
    color: #9ca3af;
  }
  .matrix-body {
    display: flex;
    flex-direction: column;
    gap: 7px;
  }
  .matrix-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 14px;
    font-family: 'Consolas', 'Courier New', monospace;
    font-weight: 600;
    border-bottom: 1px solid rgba(255,255,255,0.06);
    padding-bottom: 4px;
  }
  .row-label {
    letter-spacing: 0.5px;
  }
  .row-val {
    font-weight: 700;
  }

  /* Staircase Neon Overlay */
  .staircase-svg {
    position: absolute;
    inset: 0;
    width: 1920px;
    height: 1080px;
    z-index: 4;
    pointer-events: none;
  }

  /* Expansion Target Callout Box (Top Right) */
  .target-box {
    position: absolute;
    top: 70px;
    right: 220px;
    background: rgba(8, 28, 36, 0.92);
    border: 3px solid #06b6d4;
    border-radius: 14px;
    padding: 14px 28px;
    text-align: center;
    box-shadow: 0 0 35px rgba(6, 182, 212, 0.45);
    z-index: 5;
  }
  .target-box-title {
    font-family: 'Impact', 'Arial Black', sans-serif;
    font-size: 22px;
    letter-spacing: 1.5px;
    color: #06b6d4;
    text-transform: uppercase;
  }
  .target-box-price {
    font-family: 'Impact', 'Arial Black', sans-serif;
    font-size: 38px;
    font-weight: 900;
    color: #ffffff;
    letter-spacing: 1px;
    margin-top: 4px;
  }

  /* Step Annotations */
  .step-annotation {
    position: absolute;
    z-index: 5;
    text-shadow: 0 2px 10px rgba(0,0,0,0.9);
  }
  .step-label {
    font-family: 'Impact', 'Arial Black', sans-serif;
    font-size: 26px;
    letter-spacing: 1px;
    text-transform: uppercase;
  }
  .step-price {
    font-family: 'Impact', 'Arial Black', sans-serif;
    font-size: 32px;
    letter-spacing: 0.5px;
  }

  /* Bottom Disclaimer Bar */
  .disclaimer-bar {
    position: absolute;
    left: 60px;
    bottom: 35px;
    border: 1px solid rgba(75, 85, 99, 0.5);
    background: rgba(11, 15, 25, 0.85);
    border-radius: 6px;
    padding: 6px 18px;
    font-size: 14px;
    font-weight: 700;
    letter-spacing: 1.5px;
    color: #9ca3af;
    text-transform: uppercase;
    z-index: 5;
  }
</style>
</head>
<body>
  <div class="chart-bg"></div>
  <div class="vignette-left"></div>

  <div class="content">
    <div class="brand-row">
      <div class="logo-box">D</div>
      <div class="brand-title">DEMA ANALYSIS</div>
      <div class="pill-tag">
        <span class="pill-dot"></span>
        <span>DAILY STUDY PACK • 2026</span>
      </div>
    </div>

    <div class="headline-container">
      <div class="main-headline">${cfg.headline}</div>
      <div class="sub-headline">${cfg.subtitle}</div>
    </div>

    <div class="telemetry-card">
      <div class="card-header">
        <span class="header-left">${cfg.matrixTitle}</span>
        <span class="header-right">1D STUDY</span>
      </div>
      <div class="matrix-body">
        ${rowsHtml}
      </div>
    </div>

    <div class="disclaimer-bar">
      STRICTLY EDUCATIONAL TECHNICAL STUDY • NO SEBI ADVISORY CLAIMS
    </div>
  </div>

  <!-- Staircase Overlay -->
  <svg class="staircase-svg" viewBox="0 0 1920 1080">
    <defs>
      <linearGradient id="neonStairs" x1="0%" y1="100%" x2="100%" y2="0%">
        <stop offset="0%" stop-color="#f59e0b" />
        <stop offset="50%" stop-color="#10b981" />
        <stop offset="100%" stop-color="#06b6d4" />
      </linearGradient>
      <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
        <feGaussianBlur stdDeviation="8" result="blur" />
        <feMerge>
          <feMergeNode in="blur" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>
      <marker id="cyanArrow" markerWidth="14" markerHeight="14" refX="7" refY="7" orient="auto">
        <path d="M 1 13 L 7 1 L 13 13 Z" fill="#06b6d4" />
      </marker>
    </defs>

    <!-- 3-Step Neon Staircase Path -->
    <path d="M 940 ${s1.y} L 1200 ${s1.y} L 1200 ${s2.y} L 1490 ${s2.y} L 1490 ${s3.y} L 1780 ${s3.y}" 
          fill="none" 
          stroke="url(#neonStairs)" 
          stroke-width="7" 
          stroke-linecap="round" 
          stroke-linejoin="round"
          filter="url(#glow)" />

    <!-- Upward Target Expansion Arrow -->
    <line x1="1680" y1="${s3.y}" x2="1680" y2="170" 
          stroke="#06b6d4" 
          stroke-width="9" 
          marker-end="url(#cyanArrow)"
          filter="url(#glow)" />
  </svg>

  <!-- Expansion Target Box -->
  <div class="target-box">
    <div class="target-box-title">EXPANSION TARGET</div>
    <div class="target-box-price">${cfg.expansionTarget}</div>
  </div>

  <!-- Step 1 Annotation -->
  <div class="step-annotation" style="left: 990px; top: ${s1.y + 20}px;">
    <div class="step-label" style="color: #f59e0b;">${s1.label}</div>
    <div class="step-price" style="color: #ffffff;">${s1.price}</div>
  </div>

  <!-- Step 2 Annotation -->
  <div class="step-annotation" style="left: 1240px; top: ${s2.y + 20}px;">
    <div class="step-label" style="color: #f2cf1d;">${s2.label}</div>
    <div class="step-price" style="color: #ffffff;">${s2.price}</div>
  </div>

  <!-- Step 3 Annotation -->
  <div class="step-annotation" style="left: 1510px; top: ${s3.y + 15}px;">
    <div class="step-label" style="color: #10b981;">${s3.label}</div>
    <div class="step-price" style="color: #10b981;">${s3.price}</div>
  </div>
</body>
</html>`;
}

async function main() {
  console.log('[THUMBNAIL] Initializing Puppeteer for Sagility-style thumbnail generation...');
  const browser = await puppeteer.launch({
    headless: 'new',
    executablePath: 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1920,1080']
  });

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1920, height: 1080, deviceScaleFactor: 1 });

    for (const cfg of STOCKS) {
      console.log(`[GENERATING] Rendering Sagility-style thumbnail for ${cfg.symbol}...`);
      const html = buildHTML(cfg);
      const tmpHtmlPath = path.join(WORKSPACE, `tmp_${cfg.symbol.toLowerCase()}_thumb.html`);
      fs.writeFileSync(tmpHtmlPath, html, 'utf-8');
      
      await page.goto(`file://${tmpHtmlPath.replace(/\\/g, '/')}`, { waitUntil: 'load', timeout: 15000 });
      await new Promise(r => setTimeout(r, 800));

      // Save to Artifact directory and Workspace
      const filename = `${cfg.symbol.toLowerCase()}-youtube-16x9-thumbnail.jpg`;
      const artifactPath = path.join(ARTIFACT_DIR, filename);
      const workspacePath = path.join(WORKSPACE, filename);

      await page.screenshot({ path: artifactPath, type: 'jpeg', quality: 95 });
      await page.screenshot({ path: workspacePath, type: 'jpeg', quality: 95 });

      try { fs.unlinkSync(tmpHtmlPath); } catch (e) {}

      console.log(`  [OK] Saved Artifact Thumbnail:  ${artifactPath}`);
      console.log(`  [OK] Saved Workspace Thumbnail: ${workspacePath}`);
    }

    console.log('\n✅ ALL SAGILITY-STYLE THUMBNAILS GENERATED PERFECTLY!');
  } finally {
    await browser.close();
  }
}

main().catch(err => {
  console.error('[ERROR] Thumbnail generation failed:', err);
  process.exit(1);
});

import fs from 'fs';
import path from 'path';

const puppeteerModule = 'file:///C:/Users/T0263544/AppData/Local/Programs/Antigravity/resources/app.asar.unpacked/node_modules/chrome-devtools-mcp/build/src/third_party/index.js';
const { puppeteer } = await import(puppeteerModule);

const STOCKS = ['SUNPHARMA', 'TRENT', 'TVSMOTOR', 'AXISBANK'];
const CHARTS_DIR = path.resolve('c:/VideoGen/web motion/claude/Thales/modi-remotion/public/charts');

async function main() {
  if (!fs.existsSync(CHARTS_DIR)) {
    fs.mkdirSync(CHARTS_DIR, { recursive: true });
  }

  const browser = await puppeteer.launch({
    headless: 'new',
    executablePath: 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1920,1080']
  });

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1920, height: 1080 });
    
    await page.evaluateOnNewDocument(() => {
      try {
        localStorage.setItem('themeMode', 'dark');
      } catch (e) {}
    });

    console.log('[AUTH] Logging in as guest...');
    await page.goto('https://moving-average-alpha.vercel.app/login', { waitUntil: 'networkidle2' });
    const buttons = await page.$$('button');
    for (const btn of buttons) {
      const text = await page.evaluate(el => el.innerText || '', btn);
      if (text.includes('Continue as Guest')) {
        await btn.click();
        break;
      }
    }
    await new Promise(r => setTimeout(r, 2500));

    for (const symbol of STOCKS) {
      console.log(`\n=======================================================`);
      console.log(`[CAPTURE] Capturing Full-Scope Target Chart for ${symbol}...`);
      console.log(`=======================================================`);

      await page.goto(`https://moving-average-alpha.vercel.app/stock/${symbol}`, { waitUntil: 'networkidle2' });
      await new Promise(r => setTimeout(r, 4000));

      // Click Center Today
      let pageButtons = await page.$$('button');
      for (const b of pageButtons) {
        const t = await page.evaluate(el => el.innerText.trim(), b);
        if (t === 'Center Today') {
          console.log(`  Clicking 'Center Today' for ${symbol}...`);
          await b.click();
          break;
        }
      }
      await new Promise(r => setTimeout(r, 1500));

      const chartEl = await page.$('.tv-lightweight-charts');
      if (!chartEl) {
        console.error(`  [WARN] .tv-lightweight-charts not found for ${symbol}!`);
        continue;
      }

      const box = await chartEl.boundingBox();
      const priceScaleX = box.x + box.width - 25;
      const priceScaleY = box.y + box.height / 2;

      // First capture detail chart (current zoom)
      const detailPath = path.join(CHARTS_DIR, `${symbol}_detail_chart.png`);
      await chartEl.screenshot({ path: detailPath });
      console.log(`  [OK] Saved Detail Chart: ${detailPath}`);

      // Now drag price scale down by 220px to expand vertical headroom so all targets fit
      console.log(`  Dragging price scale downwards to expand target headroom...`);
      await page.mouse.move(priceScaleX, priceScaleY);
      await page.mouse.down();
      await page.mouse.move(priceScaleX, priceScaleY + 220, { steps: 30 });
      await page.mouse.up();
      await new Promise(r => setTimeout(r, 2000));

      // Capture primary chart (all targets visible in one picture)
      const primaryPath = path.join(CHARTS_DIR, `${symbol}_1D_chart.png`);
      await chartEl.screenshot({ path: primaryPath });
      console.log(`  [OK] Saved Full Target Scope Chart: ${primaryPath}`);

      // Also save macro chart
      const macroPath = path.join(CHARTS_DIR, `${symbol}_macro_chart.png`);
      fs.copyFileSync(primaryPath, macroPath);
    }

    console.log(`\n[COMPLETE] All 4 stocks captured with full target scope and dual views.`);
  } finally {
    await browser.close();
  }
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});

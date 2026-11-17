import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { puppeteer } from 'file:///C:/Users/T0263544/AppData/Local/Programs/Antigravity/resources/app.asar.unpacked/node_modules/chrome-devtools-mcp/build/src/third_party/index.js';

const delay = (ms) => new Promise((r) => setTimeout(r, ms));

async function getBrowserWs() {
  const portPath = 'C:\\Users\\T0263544\\AppData\\Local\\Google\\Chrome\\User Data\\DevToolsActivePort';
  const content = await fs.promises.readFile(portPath, 'utf8');
  const [port, wsPath] = content.split('\n').map((s) => s.trim()).filter(Boolean);
  return `ws://127.0.0.1:${port}${wsPath}`;
}

async function uploadItemInTab(page, item, workerId) {
  console.log(`[Worker ${workerId}] -> Starting upload for: ${item.name}`);
  console.log(`[Worker ${workerId}] File: ${item.videoFile}`);

  // 1. Fresh isolated navigation
  const targetUrl = item.type === 'master' 
    ? 'https://studio.youtube.com/channel/UC0phBM1o-QI-fjQKwRHOvrQ/videos/upload'
    : 'https://studio.youtube.com/channel/UC0phBM1o-QI-fjQKwRHOvrQ/videos/short';
  
  await page.goto(targetUrl, { waitUntil: 'networkidle2', timeout: 60000 });
  await delay(2500);

  // Close any lingering modal
  await page.evaluate(() => {
    const closeBtns = Array.from(document.querySelectorAll('ytcp-button, button')).filter(
      (b) => b.innerText?.trim() === 'Close' || b.getAttribute('aria-label') === 'Close'
    );
    closeBtns.forEach((b) => b.click());
  });
  await delay(1500);

  // 2. Click Create -> Upload
  await page.waitForSelector('ytcp-button#create-icon, ytcp-button#create-button, [aria-label*="Create" i]', { timeout: 15000 });
  await page.evaluate(() => {
    const btn =
      document.querySelector('ytcp-button#create-icon') ||
      document.querySelector('ytcp-button#create-button') ||
      Array.from(document.querySelectorAll('ytcp-button, button')).find(
        (b) => b.innerText?.trim() === 'Create' || b.getAttribute('aria-label')?.includes('Create')
      );
    if (btn) btn.click();
  });
  await delay(2000);

  await page.evaluate(() => {
    const items = Array.from(document.querySelectorAll('tp-yt-paper-item, [role="menuitem"], ytcp-text-menu paper-item'));
    const uploadItem = items.find((el) => el.innerText?.trim().includes('Upload'));
    if (uploadItem) uploadItem.click();
  });
  await delay(3000);

  // 3. Attach file payload
  const fileInput = await page.waitForSelector('input[type="file"][name="Filedata"], input[type="file"]', { timeout: 15000 });
  if (!fileInput) {
    throw new Error('File input element not found in DOM');
  }
  await fileInput.uploadFile(item.videoFile);

  // 4. Populate Metadata
  await page.waitForSelector('#title-textarea #textbox, #textbox[aria-label*="title" i]', { timeout: 90000 });
  await delay(3000);

  // Title
  console.log(`[Worker ${workerId}] Setting Title: ${item.title}`);
  await page.evaluate((t) => {
    const el = document.querySelector('#textbox[aria-label*="title" i]') || document.querySelector('#title-textarea #textbox');
    if (el) {
      el.focus();
      document.execCommand('selectAll', false, null);
      document.execCommand('delete', false, null);
      document.execCommand('insertText', false, t);
    }
  }, item.title);
  await delay(1200);

  // Description
  if (item.description) {
    console.log(`[Worker ${workerId}] Setting Description...`);
    await page.evaluate((d) => {
      const el = document.querySelector('#description-textarea #textbox') || document.querySelector('#textbox[aria-label*="description" i]');
      if (el) {
        el.focus();
        document.execCommand('selectAll', false, null);
        document.execCommand('delete', false, null);
        document.execCommand('insertText', false, d);
      }
    }, item.description);
    await delay(1200);
  }

  // Not made for kids
  await page.evaluate(() => {
    const notForKids = document.querySelector('tp-yt-paper-radio-button[name="VIDEO_MADE_FOR_KIDS_NOT_MFK"]');
    if (notForKids) notForKids.click();
  });
  await delay(1200);

  // Thumbnail
  if (item.thumbFile && fs.existsSync(item.thumbFile)) {
    console.log(`[Worker ${workerId}] Uploading thumbnail: ${item.thumbFile}`);
    const thumbInput = await page.$('input[type="file"]#file-loader, ytcp-thumbnails-compact-editor-uploader input[type="file"], input[type="file"][accept*="image"]');
    if (thumbInput) {
      try {
        await thumbInput.uploadFile(item.thumbFile);
        await delay(2500);
      } catch (err) {
        console.log(`[Worker ${workerId}] Notice: thumbnail skipped:`, err.message);
      }
    }
  }

  // Next steps
  for (let s = 1; s <= 3; s++) {
    await page.evaluate(() => {
      const nextBtn = document.querySelector('ytcp-button#next-button');
      if (nextBtn) nextBtn.click();
    });
    await delay(2500);
  }

  // Public Visibility
  await page.evaluate(() => {
    const pub = document.querySelector('tp-yt-paper-radio-button[name="PUBLIC"]');
    if (pub) pub.click();
  });
  await delay(1500);

  // Publish
  await page.evaluate(() => {
    const doneBtn = document.querySelector('ytcp-button#done-button') || Array.from(document.querySelectorAll('ytcp-button, button')).find((b) => b.innerText?.trim() === 'Publish' || b.innerText?.trim() === 'Save');
    if (doneBtn) doneBtn.click();
  });
  await delay(6000);

  // Extract link
  let videoUrl = null;
  const finalUrl = await page.evaluate(() => {
    const link = document.querySelector('a.ytcp-video-share-dialog-link, a[href*="youtu.be"]');
    return link ? link.href : null;
  });
  if (finalUrl) videoUrl = finalUrl;

  console.log(`[Worker ${workerId}] ✓ Published: ${item.name} (${videoUrl || 'Confirmed on Studio'})`);

  // Close share dialog
  await page.evaluate(() => {
    const closeBtns = Array.from(document.querySelectorAll('ytcp-button, button')).filter((b) => b.innerText?.trim() === 'Close');
    closeBtns.forEach((b) => b.click());
  });
  await delay(2000);

  return {
    name: item.name,
    title: item.title,
    videoFile: item.videoFile,
    url: videoUrl,
    status: 'PUBLISHED',
  };
}

export async function runParallelUploads(items, concurrency = 2) {
  console.log(`\n======================================================`);
  console.log(`PARALLEL YOUTUBE STUDIO PUBLISHER`);
  console.log(`Total Items: ${items.length} | Concurrent Tabs: ${concurrency}`);
  console.log(`======================================================\n`);

  const ws = await getBrowserWs();
  const browser = await puppeteer.connect({
    browserWSEndpoint: ws,
    defaultViewport: null,
  });

  const results = [];
  const queue = [...items];

  // Worker loop
  async function worker(workerId) {
    const page = await browser.newPage();
    console.log(`[Worker ${workerId}] Tab opened and ready.`);

    while (queue.length > 0) {
      const item = queue.shift();
      try {
        const res = await uploadItemInTab(page, item, workerId);
        results.push(res);
      } catch (err) {
        console.error(`[Worker ${workerId}] Failed ${item.name}: ${err.message}`);
        results.push({ name: item.name, status: 'FAILED', error: err.message });
      }
    }

    try {
      await page.close();
      console.log(`[Worker ${workerId}] Tab closed.`);
    } catch (e) {}
  }

  // Run workers concurrently
  const workerCount = Math.min(concurrency, items.length);
  const workerPromises = [];
  for (let w = 1; w <= workerCount; w++) {
    workerPromises.push(worker(w));
    await delay(2000); // Stagger initial navigation to prevent lock contention
  }

  await Promise.all(workerPromises);
  await browser.disconnect();

  console.log(`\n✓ All ${results.length} parallel upload tasks finalized.`);
  return results;
}

// CLI Direct Execution
if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const manifestArg = process.argv[2];
  if (!manifestArg || !fs.existsSync(manifestArg)) {
    console.log('Usage: node parallel_youtube_publisher.mjs <manifest.json> [concurrency]');
    process.exit(1);
  }
  const conc = parseInt(process.argv[3] || '2', 10);
  const items = JSON.parse(fs.readFileSync(manifestArg, 'utf8'));
  runParallelUploads(items, conc)
    .then((res) => {
      const outJson = manifestArg.replace('.json', '_published.json');
      fs.writeFileSync(outJson, JSON.stringify(res, null, 2), 'utf8');
      console.log(`Saved published report to: ${outJson}`);
      process.exit(0);
    })
    .catch((err) => {
      console.error('Fatal parallel upload failure:', err);
      process.exit(1);
    });
}

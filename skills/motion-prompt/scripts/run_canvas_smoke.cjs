#!/usr/bin/env node
/* Runner opcional de QA: npm install --no-save puppeteer-core, ou defina PUPPETEER_CORE. */
const path = require('node:path');
const puppeteer = require(process.env.PUPPETEER_CORE || 'puppeteer-core');

async function main() {
  const [pagePath, executablePath] = process.argv.slice(2);
  if (!pagePath || !executablePath) throw new Error('Uso: node run_canvas_smoke.cjs <pagina.html> <chromium>');
  const browser = await puppeteer.launch({
    executablePath,
    headless: true,
    args: ['--no-sandbox', '--no-zygote', '--single-process', '--disable-gpu', '--disable-dev-shm-usage'],
  });
  try {
    const page = await browser.newPage();
    const errors = [];
    page.on('pageerror', (error) => errors.push(String(error)));
    await page.goto(`file://${path.resolve(pagePath)}`, {waitUntil: 'load', timeout: 120000});
    await page.waitForSelector('#result', {timeout: 120000});
    const result = await page.$eval('#result', (element) => element.textContent);
    console.log(JSON.stringify({...JSON.parse(result), pageErrors: errors}));
  } finally {
    await browser.close();
  }
}

main().catch((error) => {
  console.error(error && error.stack || error);
  process.exitCode = 1;
});

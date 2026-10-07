import { mkdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { createRequire } from "node:module";
import { homedir } from "node:os";

const url = process.env.CAPTURE_URL;
const output = process.env.CAPTURE_DIR;

if (!url || !output) {
  console.error("Set CAPTURE_URL and CAPTURE_DIR.");
  process.exit(1);
}

let target;
try {
  target = new URL(url);
  if (!["http:", "https:"].includes(target.protocol)) throw new Error("bad protocol");
} catch {
  console.error(`Invalid CAPTURE_URL: ${url}`);
  process.exit(1);
}

mkdirSync(output, { recursive: true });

const runtime = join(homedir(), ".local/share/omgithub-playwright");
const require = createRequire(join(runtime, "package.json"));
const { chromium } = require("playwright");

let config;
try {
  const cfgPath = join(runtime, process.platform === "darwin" ? "metal.json" : "linux.json");
  config = JSON.parse(readFileSync(cfgPath, "utf8"));
} catch (err) {
  console.error(`Capture config missing: ${err.message}`);
  process.exit(1);
}

if (process.platform === "linux") {
  try {
    process.env.DISPLAY ||= ":" + readFileSync(join(runtime, "display"), "utf8").trim();
  } catch {}
}

const transient = (err) => {
  const e = err instanceof Error ? err : new Error(String(err));
  throw Object.assign(e, { exitCode: 75 });
};

let browser;
try {
  browser = await chromium.launch({ ...config.browser.launchOptions, timeout: 30000 }).catch(transient);
  for (const [name, width, height] of [["desktop", 1440, 900], ["mobile", 390, 844]]) {
    const page = await browser.newPage({ viewport: { width, height } }).catch(transient);
    page.setDefaultTimeout(30000);
    page.on("pageerror", (err) => console.error(`pageerror ${name}: ${err.message}`));
    const response = await page.goto(url, { waitUntil: "load", timeout: 45000 }).catch(transient);
    const status = response?.status();
    if (!response || !response.ok()) {
      const transientStatus = !response || [408, 429, 500, 502, 503, 504].includes(status);
      throw Object.assign(new Error(`HTTP ${status} loading preview`), { exitCode: transientStatus ? 75 : 1 });
    }
    try {
      await page.locator("body").waitFor({ state: "visible", timeout: 30000 });
      await page.waitForFunction(() => document.fonts.status === "loaded", null, { timeout: 30000 });
    } catch (err) {
      if (err.name === "TimeoutError") transient(err);
      throw err;
    }
    await page.waitForTimeout(1500);
    const shotPath = join(output, `final-${name}.png`);
    await page.screenshot({ path: shotPath, timeout: 30000 }).catch((err) => {
      if (err.name === "TimeoutError" || !browser.isConnected()) transient(err);
      throw err;
    });
    const size = statSync(shotPath).size;
    if (size < 5000) {
      throw Object.assign(new Error(`Render defect: ${shotPath} too small (${size} bytes)`), { exitCode: 1 });
    }
    console.log(`Captured ${name}: ${shotPath} (${size} bytes)`);
    await page.close();
  }
} catch (err) {
  console.error(err);
  process.exitCode = err.exitCode || 1;
} finally {
  await browser?.close().catch((err) => {
    console.error(err);
    process.exitCode ||= 75;
  });
}

import { defineConfig } from "@playwright/test";

const baseURL = "http://127.0.0.1:4173";

export default defineConfig({
  testDir: "./tests/e2e",
  timeout: 45_000,
  expect: { timeout: 10_000 },
  fullyParallel: false,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: process.env.CI ? [["line"], ["html", { open: "never" }]] : "line",
  snapshotPathTemplate: "{testDir}/__screenshots__/{platform}/{arg}-{projectName}{ext}",
  use: {
    baseURL,
    launchOptions: { args: ["--disable-gpu"] },
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
  },
  webServer: {
    command: "npm run build && npm run start -- --hostname 127.0.0.1 --port 4173",
    url: `${baseURL}/en`,
    reuseExistingServer: !process.env.CI,
    timeout: 180_000,
  },
  projects: [
    { name: "chromium-320", use: { browserName: "chromium", viewport: { width: 320, height: 568 } } },
    { name: "chromium-390", use: { browserName: "chromium", viewport: { width: 390, height: 844 } } },
    { name: "chromium-768", use: { browserName: "chromium", viewport: { width: 768, height: 1024 } } },
    { name: "chromium-1440", use: { browserName: "chromium", viewport: { width: 1440, height: 900 } } },
    { name: "chromium-1920", use: { browserName: "chromium", viewport: { width: 1920, height: 1080 } } },
  ],
});

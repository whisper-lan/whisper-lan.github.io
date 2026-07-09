import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";
import { ESLint } from "eslint";

type PackageManifest = {
  private?: boolean;
  version?: string;
  engines?: Record<string, string>;
  scripts?: Record<string, string>;
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
  overrides?: {
    next?: {
      postcss?: string;
    };
  };
};

type Lockfile = {
  packages?: Record<string, { version?: string }>;
};

const manifest = JSON.parse(
  readFileSync(new URL("../package.json", import.meta.url), "utf8"),
) as PackageManifest;

const lockfile = JSON.parse(
  readFileSync(new URL("../package-lock.json", import.meta.url), "utf8"),
) as Lockfile;

function versionAtLeast(actual: string, minimum: string): boolean {
  const actualParts = actual.split(".").map(Number);
  const minimumParts = minimum.split(".").map(Number);

  for (let index = 0; index < minimumParts.length; index += 1) {
    const difference = (actualParts[index] ?? 0) - minimumParts[index];
    if (difference !== 0) {
      return difference > 0;
    }
  }

  return true;
}

describe("web package baseline", () => {
  it("pins the supported application and tooling versions", () => {
    expect(manifest.private).toBe(true);
    expect(manifest.version).toBe("0.0.0");
    expect(manifest.engines?.node).toBe(">=20");
    expect(manifest.dependencies).toMatchObject({
      "lucide-react": "1.24.0",
      next: "15.5.20",
      "next-themes": "0.4.6",
      "server-only": "0.0.1",
    });
    expect(manifest.devDependencies).toMatchObject({
      "@axe-core/playwright": "4.12.1",
      "@eslint/eslintrc": "3.3.5",
      "@playwright/test": "1.61.1",
      eslint: "9.39.4",
      "eslint-config-next": "15.5.20",
      vitest: "3.2.7",
    });
  });

  it("exposes the verification scripts", () => {
    expect(manifest.scripts).toMatchObject({
      "audit:prod": "npm audit --omit=dev --audit-level=moderate",
      check: "npm run audit:prod && npm run lint && npm test && npm run build",
      lint: "eslint .",
      test: "vitest run",
      "test:e2e": "playwright test",
    });
    expect(manifest.scripts?.["test:release-assets"]).toBeUndefined();
  });

  it("overrides Next's bundled PostCSS with a patched release", () => {
    expect(manifest.overrides?.next?.postcss).toBe("8.5.10");

    const nestedPostcss =
      lockfile.packages?.["node_modules/next/node_modules/postcss"]?.version;
    expect(nestedPostcss).toBeDefined();
    expect(versionAtLeast(nestedPostcss ?? "0.0.0", "8.5.10")).toBe(true);
  });

  it("keeps generated Next declarations outside the lint target", async () => {
    const eslint = new ESLint({ cwd: new URL("..", import.meta.url).pathname });

    expect(await eslint.calculateConfigForFile("next-env.d.ts")).toBeUndefined();
  });
});

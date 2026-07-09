import { describe, expect, it } from "vitest";

import {
  getMessages,
  isLocale,
  localeToHtmlLang,
  locales,
} from "../lib/i18n";

function leafKeys(value: unknown, prefix = ""): string[] {
  if (typeof value === "string") {
    return [prefix];
  }
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    throw new Error(`Unexpected message value at ${prefix || "root"}`);
  }

  return Object.entries(value)
    .flatMap(([key, child]) => leafKeys(child, prefix ? `${prefix}.${key}` : key))
    .sort();
}

describe("localized messages", () => {
  it("supports only the two URL locales and maps their HTML language tags", () => {
    expect(locales).toEqual(["zh", "en"]);
    expect(isLocale("zh")).toBe(true);
    expect(isLocale("en")).toBe(true);
    expect(isLocale("zh-CN")).toBe(false);
    expect(isLocale("es")).toBe(false);
    expect(localeToHtmlLang("zh")).toBe("zh-CN");
    expect(localeToHtmlLang("en")).toBe("en");
  });

  it("keeps Chinese and English dictionaries structurally identical", () => {
    expect(leafKeys(getMessages("zh"))).toEqual(leafKeys(getMessages("en")));
  });

  it("contains no retired feature, placeholder version, or absolute promotion", () => {
    const serialized = JSON.stringify(locales.map(getMessages));

    expect(serialized).not.toMatch(
      /ftp|alpha|0\.0\.(?:0|29)|没有大小限制|跑满带宽|never miss/i,
    );
  });

  it("states the trusted-LAN and encryption boundary in both languages", () => {
    expect(getMessages("zh").hero.security).toContain("可信局域网");
    expect(getMessages("zh").hero.security).toContain("没有端到端加密");
    expect(getMessages("en").hero.security).toContain("trusted local network");
    expect(getMessages("en").hero.security).toContain("not end-to-end encrypted");
  });
});

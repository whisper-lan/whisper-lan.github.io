import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

function preferredLocale(header: string | null): "zh" | "en" {
  if (!header) {
    return "en";
  }

  const languages = header
    .split(",")
    .map((entry, index) => {
      const [range, ...parameters] = entry.trim().split(";");
      const qualityParameter = parameters.find((parameter) => parameter.trim().startsWith("q="));
      const quality = qualityParameter ? Number(qualityParameter.trim().slice(2)) : 1;
      return { range: range.toLowerCase(), quality: Number.isFinite(quality) ? quality : 0, index };
    })
    .filter(({ quality }) => quality > 0)
    .sort((left, right) => right.quality - left.quality || left.index - right.index);

  for (const { range } of languages) {
    if (range === "zh" || range.startsWith("zh-")) {
      return "zh";
    }
    if (range === "en" || range.startsWith("en-")) {
      return "en";
    }
  }
  return "en";
}

export function middleware(request: NextRequest) {
  if (request.nextUrl.pathname !== "/") {
    return NextResponse.next();
  }

  const locale = preferredLocale(request.headers.get("accept-language"));
  return NextResponse.redirect(new URL(`/${locale}`, request.url));
}

export const config = {
  matcher: "/",
};

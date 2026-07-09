/* eslint-disable @next/next/no-img-element */
import { readFile } from "node:fs/promises";
import { join } from "node:path";

import { ImageResponse } from "next/og";

import { getMessages } from "./i18n";
import type { Locale } from "./i18n";

type SocialImageKind = "openGraph" | "twitter";

const socialImageCacheControl =
  "public, max-age=0, s-maxage=86400, stale-while-revalidate=604800";

async function pngDataUrl(path: string): Promise<string> {
  const bytes = await readFile(join(process.cwd(), path));
  return `data:image/png;base64,${bytes.toString("base64")}`;
}

export async function createSocialImage(
  locale: Locale,
  kind: SocialImageKind,
): Promise<ImageResponse> {
  const messages = getMessages(locale);
  const [icon, screenshot] = await Promise.all([
    pngDataUrl("public/product/app-icon.png"),
    pngDataUrl("public/product/file-share.png"),
  ]);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          background: "#f7f8fa",
          color: "#17191d",
          fontFamily: "Arial, sans-serif",
        }}
      >
        <div
          style={{
            width: 460,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            padding: "56px 48px",
            borderRight: "1px solid #d8dde4",
          }}
        >
          <img
            src={icon}
            width="80"
            height="80"
            alt=""
            style={{ borderRadius: 8 }}
          />
          <div style={{ marginTop: 28, color: "#1768d8", fontSize: 20, fontWeight: 700 }}>
            {kind === "openGraph" ? messages.brand.context : messages.hero.eyebrow}
          </div>
          <div style={{ marginTop: 10, fontSize: 62, fontWeight: 700 }}>Whisper</div>
          <div style={{ marginTop: 16, fontSize: 28, lineHeight: 1.35 }}>
            {messages.hero.title}
          </div>
        </div>
        <div style={{ width: 740, height: 630, display: "flex", overflow: "hidden" }}>
          <img
            src={screenshot}
            width="1326"
            height="630"
            alt=""
            style={{ objectFit: "cover", objectPosition: "54% center" }}
          />
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
      headers: { "Cache-Control": socialImageCacheControl },
    },
  );
}

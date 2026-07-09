import { Download } from "lucide-react";

import { CopyDigest } from "./copy-digest";
import type { Locale, Messages } from "@/lib/i18n";
import { localeToHtmlLang } from "@/lib/i18n";
import { getSystemRequirementKeys } from "@/lib/release/system-requirements";
import type { DownloadAsset, Platform } from "@/lib/release/types";

type PlatformDownloadCardProps = {
  platform: Platform;
  assets: DownloadAsset[];
  locale: Locale;
  messages: Messages;
};

function formatBytes(bytes: number, locale: Locale): string {
  const units = ["B", "KB", "MB", "GB"] as const;
  let value = bytes;
  let unit = 0;
  while (value >= 1024 && unit < units.length - 1) {
    value /= 1024;
    unit += 1;
  }

  return `${new Intl.NumberFormat(localeToHtmlLang(locale), {
    maximumFractionDigits: unit === 0 ? 0 : 1,
  }).format(value)} ${units[unit]}`;
}

function formatName(asset: DownloadAsset): string {
  const format = asset.format === "appimage" ? "AppImage" : asset.format.toUpperCase();
  return `${format} · ${asset.arch}`;
}

export function PlatformDownloadCard({
  platform,
  assets,
  locale,
  messages,
}: PlatformDownloadCardProps) {
  const platformName = messages.download.platforms[platform];
  const requirements = getSystemRequirementKeys(platform);

  return (
    <article
      className="download-card"
      data-platform={platform}
      data-asset-count={assets.length}
      lang={localeToHtmlLang(locale)}
    >
      <header className="download-card__header">
        <div>
          <h3>{platformName}</h3>
          <p>
            {assets.length} {assets.length === 1
              ? messages.download.buildCount.one
              : messages.download.buildCount.many}
          </p>
        </div>
      </header>

      <div className="download-card__assets">
        {assets.map((asset) => (
          <div className="download-build" key={asset.id}>
            <a
              href={asset.url}
              className={`download-asset ${asset.recommended ? "download-asset--recommended" : ""}`}
              data-download-asset="true"
            >
              <Download aria-hidden="true" className="download-asset__icon" strokeWidth={1.8} />
              <span className="download-asset__label">
                <span>
                  {platformName} · {formatName(asset)} · {formatBytes(asset.bytes, locale)}
                </span>
                <span className="download-asset__filename">{asset.name}</span>
              </span>
              {asset.recommended ? (
                <span className="download-asset__recommended">{messages.download.recommended}</span>
              ) : null}
            </a>
            <div className="download-digest">
              <span>{messages.download.digestLabel}</span>
              {asset.digest ? (
                <div>
                  <code>{asset.digest}</code>
                  <CopyDigest
                    digest={asset.digest}
                    copyLabel={messages.download.copyDigest}
                    copiedLabel={messages.download.digestCopied}
                    failedLabel={messages.download.digestCopyFailed}
                  />
                </div>
              ) : (
                <p>{messages.download.digestUnavailable}</p>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="download-card__requirements">
        <h4>{messages.download.requirementsTitle}</h4>
        <ul>
          {requirements.map((key) => (
            <li key={key}>{messages.download.requirements[key]}</li>
          ))}
        </ul>
      </div>
    </article>
  );
}

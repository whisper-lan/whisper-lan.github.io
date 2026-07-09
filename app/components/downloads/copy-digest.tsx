"use client";

import { Check, Copy } from "lucide-react";
import { useState } from "react";

type ClipboardWriter = {
  writeText(text: string): Promise<void>;
};

export async function writeDigestToClipboard(
  digest: string,
  clipboard?: ClipboardWriter,
): Promise<boolean> {
  const writer = clipboard ??
    (typeof navigator === "undefined" ? undefined : navigator.clipboard);
  if (!writer) {
    return false;
  }

  try {
    await writer.writeText(digest);
    return true;
  } catch {
    return false;
  }
}

export type CopyDigestProps = {
  digest: string;
  copyLabel: string;
  copiedLabel: string;
  failedLabel: string;
};

export function CopyDigest({
  digest,
  copyLabel,
  copiedLabel,
  failedLabel,
}: CopyDigestProps) {
  const [status, setStatus] = useState<"idle" | "copied" | "failed">("idle");

  async function copyDigest() {
    const copied = await writeDigestToClipboard(digest);
    setStatus(copied ? "copied" : "failed");
  }

  const statusLabel = status === "copied"
    ? copiedLabel
    : status === "failed"
      ? failedLabel
      : "";

  return (
    <span className="copy-digest">
      <button
        type="button"
        className="icon-button"
        aria-label={copyLabel}
        title={copyLabel}
        onClick={copyDigest}
      >
        {status === "copied" ? (
          <Check aria-hidden="true" className="h-4 w-4" strokeWidth={1.9} />
        ) : (
          <Copy aria-hidden="true" className="h-4 w-4" strokeWidth={1.9} />
        )}
      </button>
      <span className="copy-digest__status" role="status" aria-live="polite">
        {statusLabel}
      </span>
    </span>
  );
}

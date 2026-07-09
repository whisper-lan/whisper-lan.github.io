import { notFound } from "next/navigation";

import { isLocale } from "@/lib/i18n";
import { createSocialImage } from "@/lib/social-image";

export const alt = "Whisper product interface";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const runtime = "nodejs";

export default async function TwitterImage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!isLocale(lang)) {
    notFound();
  }
  return createSocialImage(lang, "twitter");
}

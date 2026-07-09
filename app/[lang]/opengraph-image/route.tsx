import { notFound } from "next/navigation";

import { isLocale } from "@/lib/i18n";
import { createSocialImage } from "@/lib/social-image";

export const runtime = "nodejs";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ lang: string }> },
) {
  const { lang } = await params;
  if (!isLocale(lang)) {
    notFound();
  }
  return createSocialImage(lang, "openGraph");
}

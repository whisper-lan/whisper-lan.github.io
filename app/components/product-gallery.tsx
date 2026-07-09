import { ExternalLink } from "lucide-react";
import Image from "next/image";

import type { Locale, Messages } from "@/lib/i18n";
import { localeToHtmlLang } from "@/lib/i18n";

type ProductGalleryProps = {
  locale: Locale;
  messages: Messages;
};

const screenshots = [
  { key: "file", src: "/product/file-share.png", width: 3372, height: 1602 },
  { key: "audio", src: "/product/audio-share.png", width: 2642, height: 1604 },
  { key: "input", src: "/product/keyboard-share.png", width: 2642, height: 1604 },
] as const;

export function ProductGallery({ locale, messages }: ProductGalleryProps) {
  return (
    <section className="section-band" aria-labelledby="gallery-title" lang={localeToHtmlLang(locale)}>
      <div className="content-shell">
        <div className="section-heading">
          <p className="section-kicker">{messages.gallery.eyebrow}</p>
          <h2 id="gallery-title">{messages.gallery.title}</h2>
          <p>{messages.gallery.description}</p>
        </div>
        <div className="product-gallery">
          {screenshots.map(({ key, src, width, height }) => {
            const item = messages.gallery.items[key];
            return (
              <figure className="product-shot" key={key}>
                <a
                  href={src}
                  target="_blank"
                  rel="noreferrer"
                  className="product-shot__image-link"
                  aria-label={`${messages.gallery.viewFull}: ${item.title}`}
                >
                  <Image
                    src={src}
                    alt={item.alt}
                    width={width}
                    height={height}
                    sizes={key === "file" ? "(min-width: 900px) 1200px, 100vw" : "(min-width: 900px) 580px, 100vw"}
                    className="product-shot__image"
                  />
                </a>
                <figcaption>
                  <div>
                    <h3>{item.title}</h3>
                    <p>{item.description}</p>
                  </div>
                  <a href={src} target="_blank" rel="noreferrer" className="text-link">
                    {messages.gallery.viewFull}
                    <ExternalLink aria-hidden="true" className="h-4 w-4" strokeWidth={1.8} />
                  </a>
                </figcaption>
              </figure>
            );
          })}
        </div>
      </div>
    </section>
  );
}

// Feature pages: one page per capability people search for by name, each a
// closer look at part of the home page. The slug is the URL and stays fixed
// once published; the copy lives under `features.items` in lib/i18n.ts.

export type FeatureKey = 'fileTransfer' | 'fileBrowser' | 'windowFlow' | 'keyboardMouse' | 'audioSharing' | 'phoneControl';
export type ChapterKey = 'transfer' | 'input' | 'flow' | 'audio' | 'cast';

// `chapter`: the home page chapter that links here ("Learn more").
// `tint`: the page's light as r, g, b — the chapter's own where there is one
// (CHAPTERS in Chapters.tsx), so a page reads as that chapter opened up.
export const FEATURES: { key: FeatureKey; slug: string; chapter: ChapterKey | null; tint: [number, number, number] }[] = [
  { key: 'fileTransfer', slug: 'file-transfer', chapter: 'transfer', tint: [42, 143, 224] },
  { key: 'fileBrowser', slug: 'file-browser', chapter: null, tint: [214, 168, 58] },
  { key: 'windowFlow', slug: 'window-flow', chapter: 'flow', tint: [118, 112, 228] },
  { key: 'keyboardMouse', slug: 'keyboard-mouse-sharing', chapter: 'input', tint: [59, 179, 164] },
  { key: 'audioSharing', slug: 'audio-sharing', chapter: 'audio', tint: [143, 212, 67] },
  { key: 'phoneControl', slug: 'phone-as-mouse', chapter: null, tint: [226, 160, 72] },
];

export const featureBySlug = (slug: string) => FEATURES.find((f) => f.slug === slug);
export const featureByChapter = (chapter: ChapterKey) => FEATURES.find((f) => f.chapter === chapter);

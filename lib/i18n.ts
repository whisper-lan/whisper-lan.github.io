export const locales = ["zh", "en"] as const;

export type Locale = (typeof locales)[number];

const zh = {
  metadata: {
    title: "Whisper｜可信局域网设备协作",
    description: "在同一可信局域网内传递文本、文件、声音与键鼠输入的多平台应用。",
  },
  brand: {
    name: "Whisper",
    context: "局域网协作",
  },
  navigation: {
    ariaLabel: "主要导航",
    languageLabel: "选择语言",
    source: "源代码",
    chinese: "中文",
    english: "English",
  },
  theme: {
    loading: "正在读取主题",
    switchToLight: "切换到浅色主题",
    switchToDark: "切换到深色主题",
  },
  hero: {
    eyebrow: "同一网络，直接协作",
    title: "让身边的设备自然协作",
    description: "在电脑和手机之间传递文本与文件，并共享桌面声音和键鼠输入。",
    security: "Whisper 面向同一可信局域网内的设备直连，不提供公共中继；当前没有端到端加密，不应在不可信网络上传输敏感内容。",
    chooseBuild: "选择下载版本",
    viewSource: "查看源代码",
  },
  release: {
    eyebrow: "构建目录",
    title: "获取 Whisper",
    stable: "稳定版",
    preview: "开发预览",
    ready: "最新构建目录已读取",
    assets: "个可用安装包",
    unavailable: "暂时无法读取最新构建",
    visitRelease: "在 GitHub 查看此版本",
    visitReleases: "前往 GitHub Releases",
  },
  footer: {
    tagline: "为可信局域网内的个人设备提供直接、可见的协作通道。",
    boundary: "无公共中继，当前无端到端加密。",
    source: "源代码",
    issues: "问题反馈",
    license: "MIT 许可证",
  },
} as const;

type StringShape<T> = {
  readonly [Key in keyof T]: T[Key] extends string ? string : StringShape<T[Key]>;
};

export type Messages = StringShape<typeof zh>;

const en = {
  metadata: {
    title: "Whisper | Trusted LAN device collaboration",
    description: "A multi-platform app for moving text, files, audio, and input across a trusted local network.",
  },
  brand: {
    name: "Whisper",
    context: "LAN collaboration",
  },
  navigation: {
    ariaLabel: "Primary navigation",
    languageLabel: "Choose language",
    source: "Source code",
    chinese: "中文",
    english: "English",
  },
  theme: {
    loading: "Reading theme preference",
    switchToLight: "Switch to light theme",
    switchToDark: "Switch to dark theme",
  },
  hero: {
    eyebrow: "One network, direct collaboration",
    title: "Keep nearby devices working together",
    description: "Move text and files between computers and phones, then share desktop audio and keyboard-and-mouse input.",
    security: "Whisper connects devices on the same trusted local network without a public relay. Traffic is not end-to-end encrypted; do not transfer sensitive content on an untrusted network.",
    chooseBuild: "Choose a build",
    viewSource: "View source",
  },
  release: {
    eyebrow: "Build catalog",
    title: "Get Whisper",
    stable: "Stable",
    preview: "Development preview",
    ready: "Latest build catalog loaded",
    assets: "installers available",
    unavailable: "The latest build catalog is temporarily unavailable",
    visitRelease: "View this release on GitHub",
    visitReleases: "Open GitHub Releases",
  },
  footer: {
    tagline: "A direct, visible collaboration channel for personal devices on a trusted local network.",
    boundary: "No public relay; currently no end-to-end encryption.",
    source: "Source code",
    issues: "Report an issue",
    license: "MIT License",
  },
} as const satisfies Messages;

const dictionaries: Record<Locale, Messages> = { zh, en };

export function isLocale(value: unknown): value is Locale {
  return typeof value === "string" && locales.some((locale) => locale === value);
}

export function localeToHtmlLang(locale: Locale): "zh-CN" | "en" {
  return locale === "zh" ? "zh-CN" : "en";
}

export function getMessages(locale: Locale): Messages {
  return dictionaries[locale];
}

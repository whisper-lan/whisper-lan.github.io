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
    productAlt: "Whisper 桌面端与手机端同时显示文件传输进度",
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
  gallery: {
    eyebrow: "真实界面",
    title: "每项能力都能在界面中看见",
    description: "这些画面来自当前应用，不使用概念图代替实际状态。",
    viewFull: "查看完整画面",
    items: {
      file: {
        title: "聊天式文件传输",
        description: "桌面端与手机端在同一时间线显示文件、进度和连接状态。",
        alt: "Whisper 桌面端与手机端同时显示 APK 和日志文件的传输进度",
      },
      audio: {
        title: "多设备声音共享",
        description: "为已连接设备分配左右声道，并查看各端的同步状态。",
        alt: "Whisper 声音共享面板为两台设备分配左声道和右声道",
      },
      input: {
        title: "键鼠工作区",
        description: "按屏幕的相对位置排列桌面，让控制目标与实际桌面对应。",
        alt: "Whisper 键鼠工作区排列 iMac、MacBook 内建屏幕和 Ubuntu 屏幕",
      },
    },
  },
  capabilities: {
    eyebrow: "核心能力",
    title: "一条本地连接，覆盖日常协作",
    description: "功能围绕同一可信局域网内、由用户确认连接的设备展开。",
    items: {
      transfer: {
        title: "文本与文件",
        description: "像聊天一样发送文本、剪贴板内容与常见文件；实际大小受设备存储和网络稳定性影响。",
      },
      notifications: {
        title: "Android 通知",
        description: "将 Android 通知转发到已经连接的其他设备，统一查看来源与内容。",
      },
      audio: {
        title: "系统声音",
        description: "把一台桌面设备的系统声音共享给选中的局域网设备，并配置声道角色。",
      },
      input: {
        title: "键盘与鼠标",
        description: "排列桌面屏幕后，让指针跨过边缘切换控制目标，键盘随当前目标工作。",
      },
    },
  },
  platforms: {
    eyebrow: "平台边界",
    title: "支持范围与依赖清楚可查",
    description: "各平台成熟度和系统依赖不同，安装前请核对对应说明。",
    labels: {
      platform: "平台",
      maturity: "状态",
      requirements: "要求与限制",
    },
    items: {
      android: {
        name: "Android",
        maturity: "主要移动端",
        requirements: "提供 universal、arm64-v8a、armeabi-v7a 与 x86_64 构建；最低系统版本尚未发布。",
      },
      macos: {
        name: "macOS",
        maturity: "桌面端",
        requirements: "要求 macOS 10.15 或更高版本，可使用传输、声音与键鼠能力。",
      },
      windows: {
        name: "Windows",
        maturity: "桌面端",
        requirements: "当前发布 x86_64 构建；最低系统版本尚未发布。",
      },
      linux: {
        name: "Linux",
        maturity: "条件支持",
        requirements: "当前为 x86_64；发现依赖 Avahi，声音依赖 PulseAudio 或 PipeWire Pulse，键鼠共享目前要求 X11。",
      },
      ios: {
        name: "iOS",
        maturity: "实验",
        requirements: "要求 iOS 13 或更高版本；当前 IPA 未签名、需要侧载，且尚未完成正式测试。",
      },
    },
  },
  faq: {
    eyebrow: "常见问题",
    title: "使用前需要知道的边界",
    items: {
      start: {
        question: "怎样开始连接设备？",
        answer: "在同一局域网内打开 Whisper，选择发现的设备，并在双方确认连接后开始传输或共享。",
      },
      encryption: {
        question: "连接是否经过端到端加密？",
        answer: "目前没有端到端加密。Whisper 不提供公共中继，但仍只应在可信局域网中使用，不要在不可信网络上传输敏感内容。",
      },
      files: {
        question: "可以发送哪些文件？",
        answer: "可发送常见文件与文本；实际可用大小取决于发送端和接收端的存储空间，以及连接稳定性。",
      },
      speed: {
        question: "传输速度由什么决定？",
        answer: "速度取决于 Wi-Fi 或以太网质量、设备性能和当前网络拥塞。",
      },
      linux: {
        question: "Linux 需要哪些系统组件？",
        answer: "设备发现需要 Avahi，声音共享需要 PulseAudio 或 PipeWire Pulse 兼容层，键鼠共享目前需要 X11。",
      },
      ios: {
        question: "iOS 版本目前是什么状态？",
        answer: "当前提供未签名 IPA，需要自行侧载；该平台尚未完成正式测试，不应视为稳定发布。",
      },
    },
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
    productAlt: "Whisper desktop and mobile apps showing file transfer progress together",
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
  gallery: {
    eyebrow: "Real interface",
    title: "Every capability stays visible",
    description: "These screens come from the current app rather than a conceptual illustration.",
    viewFull: "View full image",
    items: {
      file: {
        title: "Chat-style file transfer",
        description: "Desktop and mobile show files, progress, and connection state in the same timeline.",
        alt: "Whisper desktop and mobile apps showing progress for an APK and a log file",
      },
      audio: {
        title: "Multi-device audio sharing",
        description: "Assign left and right channels to connected devices and inspect their sync state.",
        alt: "Whisper audio sharing panel assigning left and right channels to two devices",
      },
      input: {
        title: "Keyboard and mouse workspace",
        description: "Arrange desktops by their physical position so each control target matches the desk.",
        alt: "Whisper input workspace arranging an iMac, a built-in MacBook display, and an Ubuntu display",
      },
    },
  },
  capabilities: {
    eyebrow: "Core capabilities",
    title: "One local connection for everyday collaboration",
    description: "Each capability works between user-approved devices on the same trusted local network.",
    items: {
      transfer: {
        title: "Text and files",
        description: "Send text, clipboard content, and common files in a chat-like flow; practical size depends on device storage and connection stability.",
      },
      notifications: {
        title: "Android notifications",
        description: "Forward Android notifications to other connected devices with their source and content visible.",
      },
      audio: {
        title: "System audio",
        description: "Share one desktop's system audio with selected LAN devices and assign channel roles.",
      },
      input: {
        title: "Keyboard and mouse",
        description: "Arrange desktop screens, then move the pointer across an edge to change the target while the keyboard follows.",
      },
    },
  },
  platforms: {
    eyebrow: "Platform boundaries",
    title: "Support and dependencies, stated plainly",
    description: "Maturity and system dependencies differ by platform; check the relevant row before installing.",
    labels: {
      platform: "Platform",
      maturity: "Status",
      requirements: "Requirements and limits",
    },
    items: {
      android: {
        name: "Android",
        maturity: "Primary mobile",
        requirements: "Universal, arm64-v8a, armeabi-v7a, and x86_64 builds are published; the minimum OS version is not published.",
      },
      macos: {
        name: "macOS",
        maturity: "Desktop",
        requirements: "Requires macOS 10.15 or later and supports transfer, audio, and input capabilities.",
      },
      windows: {
        name: "Windows",
        maturity: "Desktop",
        requirements: "An x86_64 build is published; the minimum OS version is not published.",
      },
      linux: {
        name: "Linux",
        maturity: "Conditional",
        requirements: "Currently x86_64; discovery needs Avahi, audio needs PulseAudio or PipeWire Pulse, and input sharing currently requires X11.",
      },
      ios: {
        name: "iOS",
        maturity: "Experimental",
        requirements: "Requires iOS 13 or later; the current IPA is unsigned, must be sideloaded, and has not completed formal testing.",
      },
    },
  },
  faq: {
    eyebrow: "Frequently asked questions",
    title: "Boundaries to understand before use",
    items: {
      start: {
        question: "How do I connect devices?",
        answer: "Open Whisper on the same local network, choose a discovered device, and start transferring or sharing after both sides approve the connection.",
      },
      encryption: {
        question: "Is the connection end-to-end encrypted?",
        answer: "Not currently. Whisper has no public relay, but it should still be used only on a trusted local network; do not transfer sensitive content on an untrusted network.",
      },
      files: {
        question: "Which files can I send?",
        answer: "You can send common files and text; practical size depends on storage available on both devices and connection stability.",
      },
      speed: {
        question: "What determines transfer speed?",
        answer: "Speed depends on Wi-Fi or Ethernet quality, device performance, and current network congestion.",
      },
      linux: {
        question: "What does Linux require?",
        answer: "Discovery needs Avahi, audio sharing needs PulseAudio or PipeWire Pulse compatibility, and keyboard-and-mouse sharing currently needs X11.",
      },
      ios: {
        question: "What is the current iOS status?",
        answer: "The available IPA is unsigned and must be sideloaded. The platform has not completed formal testing and should not be treated as a stable release.",
      },
    },
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

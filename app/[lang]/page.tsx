import { notFound } from 'next/navigation';
import Home from '../page';
import { Metadata } from 'next';
import { SITE_CONFIG } from '@/lib/constants';

// 从 app/page.tsx (Home 组件) 或共享的 i18n 文件导入 messages
// 这里为了示例，我们假设可以直接引用或有一个获取翻译的函数
// 实际项目中，你可能需要将 messages 移到共享位置
const messagesForMetadata = {
    'zh': { // Assuming URL /zh maps to zh-CN content
        title: 'Whisper - 局域网设备协作，文件、声音与键鼠共享',
        description: 'Whisper 是局域网优先的跨平台设备协作工具，支持文本与文件传输、Android 通知转发、桌面系统声音共享和键鼠共享。',
        ogLocale: 'zh_CN',
        keywords: [
            'Whisper', '局域网文件传输', '本地网络共享', '离线文件传输',
            '聊天传文件', '文本传输', 'WiFi传文件', '无网络传文件', '本地共享',
            '电脑互传文件', '手机传电脑局域网', '键鼠共享', '系统声音共享'
        ]
    },
    'en': {
        title: 'Whisper: LAN collaboration for files, audio, and input',
        description: 'Send files and text, forward Android notifications, share desktop audio, and control nearby desktops with keyboard and mouse on your LAN.',
        ogLocale: 'en_US',
        keywords: [
            'Whisper', 'Chat-Style Transfer', 'LAN file transfer', 'offline sharing', 'P2P chat', 'keyboard mouse sharing', 'desktop audio sharing'
        ]
    }
};

// 定义支持的语言 (与 generateStaticParams 和 layout 逻辑保持一致)
const supportedLanguages = ['en', 'zh'];

// 验证语言参数
export async function generateStaticParams() {
    return supportedLanguages.map((lang) => ({ lang }));
}

// Type for resolved params
type ResolvedParams = { lang: string };

// Props can receive either resolved params or a promise of resolved params
type Props = {
    params: Promise<ResolvedParams>;
}

export async function generateMetadata({ params: paramsProp }: Props): Promise<Metadata> {
    // Await params at the beginning. If it's already resolved, await won't harm.
    const params = await paramsProp;

    const lang = supportedLanguages.includes(params.lang) ? params.lang : 'en';
    const localeMessages = messagesForMetadata[lang as keyof typeof messagesForMetadata] || messagesForMetadata.en;

    const pageUrl = `${SITE_CONFIG.baseUrl}/${lang}`;
    const ogImageUrl = `${SITE_CONFIG.baseUrl}/og-image.jpg`; // 假设 og-image 在 public 目录下

    return {
        title: localeMessages.title,
        description: localeMessages.description,
        keywords: localeMessages.keywords,
        alternates: {
            canonical: pageUrl,
            languages: {
                'x-default': `${SITE_CONFIG.baseUrl}/`, // Or your primary language version e.g., /zh
                'en': `${SITE_CONFIG.baseUrl}/en`,
                'zh': `${SITE_CONFIG.baseUrl}/zh`,
                // Add other languages if any
            },
        },
        openGraph: {
            title: localeMessages.title,
            description: localeMessages.description,
            url: pageUrl,
            siteName: SITE_CONFIG.title, // Or localized site name
            images: [
                {
                    url: ogImageUrl,
                    width: 1200,
                    height: 630,
                    alt: localeMessages.title, // Alt text for OG image
                }
            ],
            locale: localeMessages.ogLocale,
            alternateLocale: lang === 'en' ? ['zh_CN'] : ['en_US'], // Example
            type: 'website',
        },
        twitter: {
            card: 'summary_large_image',
            title: localeMessages.title,
            description: localeMessages.description,
            images: [ogImageUrl],
        },
        // manifest, icons can be inherited from root layout or customized here
    };
}

export default async function LocalePage(
    { params: paramsProp }: Props // Destructure and rename params to paramsProp
) {
    // Await params at the beginning
    const params = await paramsProp;

    if (!supportedLanguages.includes(params.lang)) {
        notFound();
    }

    const initialLanguage = params.lang === 'zh' ? 'zh-CN' : 'en';

    return <Home initialLanguage={initialLanguage} />;
}

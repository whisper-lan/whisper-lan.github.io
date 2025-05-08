import { notFound } from 'next/navigation';
import Home from '../page';
import { Metadata } from 'next';
import { SITE_CONFIG } from '@/lib/constants';

// 从 app/page.tsx (Home 组件) 或共享的 i18n 文件导入 messages
// 这里为了示例，我们假设可以直接引用或有一个获取翻译的函数
// 实际项目中，你可能需要将 messages 移到共享位置
const messagesForMetadata = {
    'zh': { // Assuming URL /zh maps to zh-CN content
        title: 'Whisper - 对话式局域网文件与文本传输，简单快速',
        description: '使用 Whisper 的简洁聊天界面，在您的本地网络 (LAN) 内安全地发送文件和消息。无需互联网，即可在设备间进行快速共享。您理想的离线文件传输与本地通讯工具何必是文件传输助手。',
        ogLocale: 'zh_CN',
        keywords: [
            'Whisper', '局域网文件传输', '本地网络共享', '离线文件传输',
            '聊天传文件', '文本传输', 'WiFi传文件', '无网络传文件', '安全本地共享',
            '电脑互传文件', '手机传电脑局域网'
        ]
    },
    'en': {
        title: 'Whisper: Chat-Style LAN File & Text Transfer',
        description: 'Send files & texts on your LAN via chat. Fast, simple sharing, no internet needed. Ideal offline file transfer & local messenger.',
        ogLocale: 'en_US',
        keywords: [
            'Whisper', 'Chat-Style Transfer', 'LAN file transfer', 'offline sharing', 'P2P chat', 'local messenger', 'WiFi direct'
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

    // 将 lang 参数传递给 Home 组件
    return (
        <div>
            <Home />
        </div>
    );
}
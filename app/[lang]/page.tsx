import { notFound } from 'next/navigation';
import Home from '../page';
import { Metadata } from 'next';
import { SITE_CONFIG } from '@/lib/constants';

// 从 app/page.tsx (Home 组件) 或共享的 i18n 文件导入 messages
// 这里为了示例，我们假设可以直接引用或有一个获取翻译的函数
// 实际项目中，你可能需要将 messages 移到共享位置
const messagesForMetadata = {
    'zh': { // Assuming URL /zh maps to zh-CN content
        title: 'Whisper - 快速、简单、对话式的局域网文件传输', // 从 app/page.tsx 的 messages.zh-CN.title
        description: '快速、简单、对话式的局域网文件传输应用, 支持多设备, 转发安卓设备通知 启动一个FTP服务(alpha)',
        ogLocale: 'zh_CN',
        keywords: ['whisper', '文件传输', '局域网传输', '跨平台传输', '无线传输', '传文件', '本地文件互传'] // 中文关键词示例
    },
    'en': {
        title: 'Whisper - Fast, Simple, Chat-style LAN File Transfer', // 从 app/page.tsx 的 messages.en.title
        description: 'Fast, Simple, Chat-style LAN file transfer. support multi-device transfer, Android notification sync, start a FTP server (alpha)',
        ogLocale: 'en_US',
        keywords: ['whisper', 'file transfer', 'LAN transfer', 'wireless transfer', 'local transfer', 'offline file transfer'] // 英文关键词示例
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
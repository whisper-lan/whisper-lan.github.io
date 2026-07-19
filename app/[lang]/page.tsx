import { notFound } from 'next/navigation';
import { HomePage } from '../components/HomePage';
import { Metadata } from 'next';
import { SITE_CONFIG } from '@/lib/constants';
import { fetchReleaseInfo } from '@/lib/release';

// 从 app/page.tsx (Home 组件) 或共享的 i18n 文件导入 messages
// 这里为了示例，我们假设可以直接引用或有一个获取翻译的函数
// 实际项目中，你可能需要将 messages 移到共享位置
const messagesForMetadata = {
    'zh': { // Assuming URL /zh maps to zh-CN content
        title: 'Whisper - 端到端加密的局域网设备协作工具',
        description: '支持系统快捷发送、二维码配对、断点续传、媒体预览、Android 通知、桌面系统声音和键鼠共享。',
        ogLocale: 'zh_CN',
        keywords: [
            'Whisper', '局域网文件传输', '本地网络共享', '离线文件传输',
            '聊天传文件', '文本传输', 'WiFi传文件', '无网络传文件', '本地共享',
            '电脑互传文件', '手机传电脑局域网', '端到端加密传输', '二维码配对', '系统快捷发送', '键鼠共享', '系统声音共享'
        ]
    },
    'en': {
        title: 'Whisper: encrypted LAN transfer and device collaboration',
        description: 'Quick-send files and text, pair by QR, preview media, resume large transfers, and share audio or input over an encrypted LAN connection.',
        ogLocale: 'en_US',
        keywords: [
            'Whisper', 'encrypted LAN transfer', 'system quick send', 'QR pairing', 'media preview', 'resumable transfer', 'keyboard mouse sharing', 'desktop audio sharing'
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
            locale: localeMessages.ogLocale,
            alternateLocale: lang === 'en' ? ['zh_CN'] : ['en_US'], // Example
            type: 'website',
        },
        twitter: {
            card: 'summary_large_image',
            title: localeMessages.title,
            description: localeMessages.description,
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
    // 服务端拉取 Release 数据（ISR 缓存 1 小时），失败时页面内客户端兜底重试
    const release = await fetchReleaseInfo();

    return <HomePage initialLanguage={initialLanguage} initialRelease={release} />;
}

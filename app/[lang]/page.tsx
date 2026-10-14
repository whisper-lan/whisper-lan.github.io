import { notFound } from 'next/navigation';
import { HomePage } from '../components/HomePage';
import { Metadata } from 'next';
import { SITE_CONFIG } from '@/lib/constants';
import { fetchReleaseInfo } from '@/lib/release';
import { messages } from '@/lib/i18n';

// 从 app/page.tsx (Home 组件) 或共享的 i18n 文件导入 messages
// 这里为了示例，我们假设可以直接引用或有一个获取翻译的函数
// 实际项目中，你可能需要将 messages 移到共享位置
const messagesForMetadata = {
    'zh': { // Assuming URL /zh maps to zh-CN content
        title: messages['zh-CN'].meta.title,
        description: 'Whisper 支持局域网加密传文件、二维码配对、断点续传、通知与声音共享；支持视频 App 通过 DLNA 投屏到电脑，以及 Android 手机体感鼠标、触控板和虚拟键盘控制电脑。',
        ogLocale: 'zh_CN',
        keywords: [
            'Whisper', '局域网文件传输', '本地网络共享', '离线文件传输',
            '聊天传文件', '文本传输', 'WiFi传文件', '无网络传文件', '本地共享',
            '电脑互传文件', '手机传电脑局域网', '端到端加密传输', '二维码配对', '系统快捷发送', '键鼠共享', '系统声音共享',
            '视频App投屏', 'DLNA接收器', '安卓手机当鼠标', '手机控制电脑', '体感鼠标', '手机触控板'
        ]
    },
    'en': {
        title: messages.en.meta.title,
        description: 'Share files, audio, and input over encrypted LAN sessions. Cast video apps to your computer via DLNA, or control it with an Android motion mouse, touchpad, and virtual keyboard.',
        ogLocale: 'en_US',
        keywords: [
            'Whisper', 'encrypted LAN transfer', 'system quick send', 'QR pairing', 'media preview', 'resumable transfer', 'keyboard mouse sharing', 'desktop audio sharing',
            'DLNA receiver', 'video app casting', 'Android mouse and keyboard', 'phone computer control', 'motion mouse', 'phone touchpad'
        ]
    }
};

// 定义支持的语言 (与 generateStaticParams 和 layout 逻辑保持一致)
const supportedLanguages = ['en', 'zh'];
export const dynamicParams = false;

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
    // 构建时预取 Release 数据；浏览器加载后刷新，避免静态页面版本过期
    const release = await fetchReleaseInfo();

    return <HomePage initialLanguage={initialLanguage} initialRelease={release} />;
}

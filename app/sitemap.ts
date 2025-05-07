import { MetadataRoute } from 'next';
import { SITE_CONFIG } from '@/lib/constants'; // 确保路径正确

// 定义支持的语言 (与 app/[lang]/page.tsx 和 layout 逻辑保持一致)
const supportedLanguages = ['en', 'zh']; // 如果URL用zh-CN，则改为 'zh-CN'

export default function sitemap(): MetadataRoute.Sitemap {
    const baseUrl = SITE_CONFIG.baseUrl;

    // 语言特定页面
    const languageUrls = supportedLanguages.map((lang) => ({
        url: `${baseUrl}/${lang}`,
        lastModified: new Date(), // 或者更精确的修改日期, 例如从CMS或git历史获取
        changeFrequency: 'weekly' as 'weekly', // 类型断言以匹配 MetadataRoute.Sitemap
        priority: 0.8,
    }));

    // 根页面 (通常作为 x-default 或主要语言)
    const rootUrl = {
        url: baseUrl, // 或者 `${baseUrl}/` 确保斜杠一致性
        lastModified: new Date(),
        changeFrequency: 'monthly' as 'monthly',
        priority: 1.0,
        // 如果根页面有特定语言内容，并且希望在此处明确 hreflang (虽然通常在页面 metadata 中处理更佳)
        // alternates: {
        //   languages: {
        //     'x-default': baseUrl,
        //     'en': `${baseUrl}/en`,
        //     'zh': `${baseUrl}/zh`,
        //   },
        // },
    };

    return [
        rootUrl,
        ...languageUrls,
        // 如果有其他静态或动态页面，例如博客文章，也在这里添加
        // {
        //   url: `${baseUrl}/blog`, 
        //   lastModified: new Date(),
        //   changeFrequency: 'daily',
        //   priority: 0.7,
        // },
    ];
} 
import { notFound } from 'next/navigation';
import Home from '../page';

// 定义支持的语言
const languages = ['en', 'zh', 'zh-CN'];

// 验证语言参数
export async function generateStaticParams() {
    return languages.map((lang) => ({ lang }));
}

export default function LocalePage({ params }: { params: { lang: string } }) {
    // 验证语言参数
    if (!languages.includes(params.lang)) {
        notFound();
    }

    return (
        <div>
            <Home />
        </div>
    );
}
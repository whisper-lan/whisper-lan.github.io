import { notFound } from 'next/navigation';
import Home from '../page';

// 定义支持的语言
const languages = ['en', 'zh', 'zh-CN'];

// 验证语言参数
export async function generateStaticParams() {
    return languages.map((lang) => ({ lang }));
}

type Props = {
    params: Promise<{
        lang: string
    }>
}

export default async function LocalePage(
    props: Props
) {
    const params = await props.params;
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
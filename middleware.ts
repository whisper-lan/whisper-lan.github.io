import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    const pathname = request.nextUrl.pathname;

    // 如果访问根路径，根据用户语言重定向
    if (pathname === '/') {
        const language = request.headers.get('accept-language')?.split(',')[0].split('-')[0] || 'en';
        return NextResponse.redirect(new URL(`/${language === 'zh' ? 'zh' : 'en'}`, request.url));
    }
}

export const config = {
    matcher: '/',
}; 
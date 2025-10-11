import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    const token = request.cookies.get('mb_session')?.value;
    const { pathname } = request.nextUrl;

    // Auth gerektiren sayfalar
    const protectedPaths = ['/dashboard', '/profile', '/orders', '/admin','/atmfinder'];
    // Auth sayfaları
    const authPaths = ['/sign-in', '/sign-up'];

    // API, static dosyalar vb. atla
    if (pathname.startsWith('/api') ||
        pathname.startsWith('/_next') ||
        pathname.startsWith('/favicon') ||
        pathname.includes('.')) {
        return NextResponse.next();
    }

    const isProtectedPath = protectedPaths.some(path => pathname.startsWith(path));
    const isAuthPath = authPaths.some(path => pathname.startsWith(path));

    // Protected route - token yoksa login'e yönlendir
    if (isProtectedPath && !token) {
        const url = request.nextUrl.clone();
        url.pathname = '/sign-in';
        url.searchParams.set('redirect', pathname);
        return NextResponse.redirect(url);
    }

    // Auth sayfasında token varsa dashboard'a yönlendir
    if (isAuthPath && token) {
        const redirectTo = request.nextUrl.searchParams.get('redirect') || '/';
        const url = request.nextUrl.clone();
        url.pathname = redirectTo;
        url.search = '';
        return NextResponse.redirect(url);
    }

    return NextResponse.next();
}
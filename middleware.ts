import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  // Basic認証をスキップするパス
  const publicPaths = ['/api/health'];
  
  if (publicPaths.some(path => request.nextUrl.pathname.startsWith(path))) {
    return NextResponse.next();
  }

  // 環境変数から認証情報を取得
  const basicAuth = request.headers.get('authorization');
  const url = request.nextUrl;

  if (basicAuth) {
    const authValue = basicAuth.split(' ')[1];
    const [user, pwd] = atob(authValue).split(':');

    const validUser = process.env.BASIC_AUTH_USER;
    const validPassword = process.env.BASIC_AUTH_PASSWORD;

    // 認証情報が正しい場合は次の処理へ
    if (user === validUser && pwd === validPassword) {
      return NextResponse.next();
    }
  }

  // 認証が必要な場合は401を返す
  url.pathname = '/api/auth';

  return new NextResponse('Authentication required', {
    status: 401,
    headers: {
      'WWW-Authenticate': 'Basic realm="Secure Area"',
    },
  });
}

// ミドルウェアを適用するパスを指定
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};

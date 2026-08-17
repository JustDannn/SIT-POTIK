import { NextResponse, type NextRequest } from "next/server";
import { decrypt } from "@/utils/session"; // Import fungsi dekripsi JWT kita

export async function proxy(request: NextRequest) {
  const path = request.nextUrl.pathname;

  // Cek apakah user mau akses area dashboard
  const isDashboardRoute = path.startsWith("/dashboard");
  const isLoginRoute = path.startsWith("/login");

  // Ambil cookie session
  const sessionCookie = request.cookies.get("session")?.value;

  let isAuthenticated = false;

  if (sessionCookie) {
    try {
      const session = await decrypt(sessionCookie);
      if (session?.userId) {
        isAuthenticated = true;
      }
    } catch (e) {
      // Kalau token invalid / expired
      isAuthenticated = false;
    }
  }

  // 1. Kalau belum login tapi maksa masuk /dashboard -> lempar ke /login
  if (isDashboardRoute && !isAuthenticated) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  // 2. Kalau sudah login tapi malah buka halaman /login -> lempar ke /dashboard
  if (isLoginRoute && isAuthenticated) {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder assets
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|uploads)$).*)",
  ],
};

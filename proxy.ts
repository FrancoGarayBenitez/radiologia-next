import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function proxy(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Refresca la sesión — no remover
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;
  const rol = user?.user_metadata?.rol as string | undefined;

  // Rutas exclusivas del médico — el técnico no tiene acceso
  const medicoOnlyRoutes = ["/paciente", "/solicitud", "/historial", "/dashboard"];
  const isMedicoOnly = medicoOnlyRoutes.some((r) => pathname.startsWith(r));

  if (isMedicoOnly && user && rol === "tecnico") {
    const url = request.nextUrl.clone();
    url.pathname = "/tecnico";
    return NextResponse.redirect(url);
  }

  // Rutas protegidas — requieren sesión activa
  const protectedRoutes = ["/paciente", "/solicitud", "/historial", "/dashboard", "/tecnico"];
  const isProtected = protectedRoutes.some((route) =>
    pathname.startsWith(route)
  );

  if (isProtected && !user) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  // Si ya hay sesión activa, redirigir desde login/registro según rol
  const authRoutes = ["/login", "/registro"];
  const isAuthRoute = authRoutes.some((route) => pathname.startsWith(route));

  if (isAuthRoute && user) {
    const url = request.nextUrl.clone();
    url.pathname = rol === "tecnico" ? "/tecnico" : "/dashboard";
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};

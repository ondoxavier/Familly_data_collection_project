import { NextResponse, type NextRequest } from "next/server";

function unauthorized() {
  return new Response("Authentification administrateur requise.", {
    status: 401,
    headers: {
      "WWW-Authenticate": 'Basic realm="Family Data Admin"',
    },
  });
}

function credentialsAreValid(header: string | null) {
  const adminPassword = process.env.ADMIN_PASSWORD;
  if (!adminPassword) {
    return process.env.NODE_ENV !== "production";
  }

  if (!header?.startsWith("Basic ")) {
    return false;
  }

  const decoded = Buffer.from(header.slice("Basic ".length), "base64").toString("utf8");
  const separatorIndex = decoded.indexOf(":");
  if (separatorIndex === -1) {
    return false;
  }

  const username = decoded.slice(0, separatorIndex);
  const password = decoded.slice(separatorIndex + 1);

  return username === (process.env.ADMIN_USERNAME ?? "admin") && password === adminPassword;
}

export function proxy(request: NextRequest) {
  const adminPassword = process.env.ADMIN_PASSWORD;
  if (!adminPassword && process.env.NODE_ENV === "production") {
    return new Response("ADMIN_PASSWORD doit être configuré avant d'exposer /admin.", {
      status: 503,
    });
  }

  if (!credentialsAreValid(request.headers.get("authorization"))) {
    return unauthorized();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};

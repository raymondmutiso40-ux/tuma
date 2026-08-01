export { default } from "next-auth/middleware";

export const config = {
  // Protects everything under /admin except the login page itself
  // (which needs to be reachable while logged out).
  matcher: ["/admin/((?!login).*)"],
};

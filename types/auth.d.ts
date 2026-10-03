import "next-auth";
declare module "next-auth" { interface User { role: "CUSTOMER" | "ADMIN" } interface Session { user: { id: string; role: "CUSTOMER" | "ADMIN"; email?: string | null; name?: string | null } } }
declare module "next-auth/jwt" { interface JWT { role?: "CUSTOMER" | "ADMIN" } }

export function orderAccess(roles: readonly string[]): "staff" | "customer" | "denied" {
  if (roles.some((role) => role === "admin" || role === "equipe")) return "staff";
  if (roles.includes("operador_certidao")) return "denied";
  return "customer";
}
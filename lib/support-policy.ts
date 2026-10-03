export function isAdminRole(role: string | null | undefined) {
  return role === "ADMIN";
}

export function ticketOwnerWhere(reference: string, userId: string) {
  return { reference, userId };
}
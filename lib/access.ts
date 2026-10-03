import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { isAdminRole } from "@/lib/support-policy";
export { isAdminRole, ticketOwnerWhere } from "@/lib/support-policy";

export async function currentActor() {
  const session = await auth();
  if (!session?.user?.id) return null;
  return prisma.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, email: true, name: true, role: true },
  });
}

export async function currentAdmin() {
  const actor = await currentActor();
  return isAdminRole(actor?.role) ? actor : null;
}
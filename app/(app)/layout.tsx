import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import BottomNav from "@/components/ui/BottomNav";

// Force dynamic rendering — child pages use browser-only APIs (Mapbox)
export const dynamic = "force-dynamic";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  // Redirect to farm setup if user has no farms
  const userId = (session.user as any).id;
  const farmCount = await prisma.farm.count({ where: { ownerId: userId } });
  if (farmCount === 0) {
    redirect("/setup-farm");
  }

  return (
    <div className="relative min-h-screen max-w-[430px] mx-auto">
      <main className="pb-[calc(56px+env(safe-area-inset-bottom))]">
        {children}
      </main>
      <BottomNav />
    </div>
  );
}

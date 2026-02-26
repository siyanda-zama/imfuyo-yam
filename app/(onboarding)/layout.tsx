import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";

export default async function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  // Admin users don't need farm setup
  const role = (session.user as any).role;
  if (role === 'ADMIN') redirect("/admin");

  return (
    <div className="min-h-screen max-w-[430px] mx-auto bg-background">
      {children}
    </div>
  );
}

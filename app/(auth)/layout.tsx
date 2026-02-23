import OfflineBanner from "@/components/ui/OfflineBanner";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-navy">
      <OfflineBanner />
      {children}
    </div>
  );
}

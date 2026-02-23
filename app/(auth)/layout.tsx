import OfflineBanner from "@/components/ui/OfflineBanner";
import Image from "next/image";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative min-h-screen animate-gradient-shift">
      <Image
        src="/images/farm-kzn.jpg"
        alt=""
        fill
        className="object-cover opacity-[0.07]"
        priority
      />
      <div className="relative z-10">
        <OfflineBanner />
        {children}
      </div>
    </div>
  );
}

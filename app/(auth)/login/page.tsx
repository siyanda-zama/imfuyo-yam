import { redirect } from 'next/navigation';
import Image from 'next/image';
import { auth } from '@/lib/auth';
import AuthForm from '@/components/auth/AuthForm';

export default async function LoginPage() {
  const session = await auth();

  if (session) {
    redirect('/');
  }

  return (
    <div className="min-h-screen flex flex-col bg-navy">
      {/* Top Half — Branded Header */}
      <div className="bg-gradient-to-b from-navy to-navy-light flex flex-col items-center justify-center pt-16 pb-12">
        <Image
          src="/herdguard-logo.jpeg"
          alt="HerdGuard"
          width={140}
          height={140}
          className="rounded-full"
          priority
        />
        <h1 className="font-heading text-white text-3xl mt-4">HerdGuard</h1>
        <p className="text-cyan mt-1 text-sm">Smart Livestock Protection</p>
      </div>

      {/* Bottom Half — Auth Form */}
      <div className="bg-navy-light rounded-t-3xl -mt-6 relative z-10 p-6 flex-1 border-t border-cyan/20">
        <AuthForm mode="login" />
      </div>
    </div>
  );
}

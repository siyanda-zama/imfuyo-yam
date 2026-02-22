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
    <div className="min-h-screen flex flex-col">
      {/* Top Half — Branded Header */}
      <div className="bg-gradient-to-b from-primary to-primary-dark flex flex-col items-center justify-center pt-16 pb-12">
        <Image
          src="/imfuyo-logo.png"
          alt="Imfuyo Yam"
          width={120}
          height={120}
          priority
        />
        <h1 className="font-heading text-white text-3xl mt-4">Imfuyo Yam</h1>
        <p className="text-primary-light mt-1">Protect your livestock</p>
      </div>

      {/* Bottom Half — Auth Form */}
      <div className="bg-white rounded-t-3xl -mt-6 relative z-10 p-6 flex-1">
        <AuthForm mode="login" />
      </div>
    </div>
  );
}

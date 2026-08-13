import type { Metadata } from 'next';

import { LoginForm } from '@/app/admin/belepes/login-form';

export const metadata: Metadata = {
  title: 'Belépés',
  robots: { index: false, follow: false },
};

export default function LoginPage() {
  return (
    <div className="on-dark flex min-h-screen items-center justify-center bg-background px-5 py-16">
      <div className="w-full max-w-sm">
        <img
          src="/logo-white.png"
          alt="Csupor Craft Beer"
          width={680}
          height={204}
          className="h-7 w-auto"
        />
        <h1 className="mt-10 font-display text-3xl">Belépés</h1>
        <p className="mt-3 text-sm text-muted">A söreink kezeléséhez jelentkezz be.</p>

        <LoginForm />
      </div>
    </div>
  );
}

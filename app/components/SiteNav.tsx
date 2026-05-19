'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import SignOutButton from './SignOutButton';

export default function SiteNav() {
  const [user, setUser] = useState<{
    id: string;
    name: string;
    email: string;
  } | null>(null);

  useEffect(() => {
    let mounted = true;

    async function fetchMe() {
      try {
        const res = await fetch('/api/auth/me');

        if (res.ok) {
          const data = await res.json();

          if (mounted) {
            setUser(data.user ?? null);
          }
        } else {
          if (mounted) {
            setUser(null);
          }
        }
      } catch {
        if (mounted) {
          setUser(null);
        }
      }
    }

    fetchMe();

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <header className="sticky top-0 z-50 border-b border-yellow-100/10 bg-[#17140f]/70 backdrop-blur-2xl">
      {/* soft glow */}
      <div className="absolute inset-0 bg-gradient-to-r from-yellow-50/3 via-transparent to-yellow-100/2" />

      <nav className="relative mx-auto flex w-full max-w-7xl items-center justify-between px-6 py-4">
        {/* LEFT */}
        <div className="flex items-center gap-10">
          {/* LOGO */}
          <Link
            href="/"
            className="group flex items-center gap-3 transition-all duration-300"
          >
         <div className="overflow-hidden rounded-full border border-yellow-100/10 bg-white/10 p-1 shadow-lg shadow-yellow-100/5">
  <Image
    src="/synapse.png"
    alt="Synapse Logo"
    width={40}
    height={40}
    priority
    unoptimized
    className="h-10 w-10 object-contain"
  />
</div>

            <div className="flex flex-col leading-none">
              <span className="text-xl font-semibold tracking-tight text-yellow-50">
                Synapse
              </span>

              <span className="text-[11px] tracking-[0.25em] text-yellow-50/40 uppercase">
                Intelligence
              </span>
            </div>
          </Link>

          {/* NAV LINKS */}
          <div className="hidden items-center gap-7 md:flex">
            <NavLink href="/docs" label="Docs" />
            <NavLink href="/status" label="Status" />

            {user && (
              <>
                <NavLink href="/dashboard" label="Dashboard" />
                <NavLink href="/chat" label="Chat" />
                <NavLink href="/profile" label="Profile" />
              </>
            )}
          </div>
        </div>

        {/* RIGHT */}
        <div className="flex items-center gap-3">
          {user ? (
            <div className="flex items-center gap-4">
              {/* USER */}
              <div className="hidden items-center gap-3 rounded-full border border-yellow-100/10 bg-white/[0.03] px-4 py-2 sm:flex">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-[#fff7cc] to-[#fff1a6] text-sm font-semibold text-[#3b3210]">
                  {user.name.charAt(0).toUpperCase()}
                </div>

                <div className="flex flex-col leading-tight">
                  <span className="text-xs text-yellow-50/50">
                    Welcome back
                  </span>

                  <span className="text-sm font-medium text-yellow-50">
                    {user.name}
                  </span>
                </div>
              </div>

              {/* SIGN OUT */}
              <div className="rounded-full border border-yellow-100/10 bg-yellow-50/[0.03] px-2 py-1 backdrop-blur-md">
                <SignOutButton />
              </div>
            </div>
          ) : (
            <>
              {/* LOGIN */}
              <Link
                href="/login"
                className="rounded-full border border-yellow-100/10 bg-white/[0.03] px-5 py-2.5 text-sm font-medium text-yellow-50/90 transition-all duration-300 hover:border-yellow-100/20 hover:bg-yellow-50/[0.06] hover:text-yellow-100"
              >
                Login
              </Link>

              {/* REGISTER */}
              <Link
                href="/register"
                className="rounded-full bg-gradient-to-r from-[#fff7cc] to-[#fff1a6] px-5 py-2.5 text-sm font-semibold text-[#000000] shadow-lg shadow-yellow-100/5 transition-all duration-300 hover:scale-[1.03] hover:from-[#fff9d9] hover:to-[#fff4ba]"
              >
                <span className='text-black'>

                Register
                </span>
              </Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}

function NavLink({
  href,
  label,
}: {
  href: string;
  label: string;
}) {
  return (
    <Link
      href={href}
      className="group relative text-sm font-medium text-yellow-50/65 transition duration-300 hover:text-yellow-100"
    >
      {label}

      <span className="absolute -bottom-1 left-0 h-[1px] w-0 bg-yellow-100 transition-all duration-300 group-hover:w-full" />
    </Link>
  );
}
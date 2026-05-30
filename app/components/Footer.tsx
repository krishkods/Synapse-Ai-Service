import Link from 'next/link';
import Image from 'next/image';

export default function Footer() {
  return (
    <footer className="relative overflow-hidden border-t border-yellow-200/40 bg-white/80 backdrop-blur-2xl">
      {/* Ambient glow */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-0 top-0 h-[250px] w-[250px] rounded-full bg-yellow-100/30 blur-3xl" />
        <div className="absolute bottom-0 right-0 h-[220px] w-[220px] rounded-full bg-amber-100/20 blur-3xl" />
      </div>

      <div className="relative mx-auto flex w-full max-w-7xl flex-col gap-14 px-6 py-14 sm:px-10">
        {/* TOP */}
        <div className="grid gap-12 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
          {/* BRAND */}
          <div>
            <div className="flex items-center gap-3">
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

              <div>
                <h2 className="text-2xl font-semibold tracking-tight text-[#2b2418]">
                  Synapse
                </h2>

                <p className="text-xs uppercase tracking-[0.28em] text-amber-700/70">
                  Intelligence
                </p>
              </div>
            </div>

            <p className="mt-6 max-w-md leading-7 text-[#5f5545]">
              Synapse is a next-generation cognitive infrastructure platform
              that brings persistent semantic memory, adaptive retrieval, and
              intelligent personalization to AI systems.
            </p>

            <div className="mt-6 flex items-center gap-3">
              <div className="rounded-full border border-yellow-200 bg-yellow-50 px-4 py-2 text-sm text-amber-700">
                AI Memory
              </div>

              <div className="rounded-full border border-yellow-200 bg-yellow-50 px-4 py-2 text-sm text-amber-700">
                Semantic Search
              </div>
            </div>
          </div>

          {/* PRODUCT */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-[0.24em] text-[#2b2418]">
              Product
            </h3>

            <div className="mt-5 flex flex-col gap-4">
              <FooterLink href="/" label="Home" />
              <FooterLink href="/docs" label="Documentation" />
              <FooterLink href="/pricing" label="Pricing" />
              <FooterLink href="/dashboard" label="Dashboard" />
              <FooterLink href="/status" label="Status" />
            </div>
          </div>

          {/* ACCOUNT */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-[0.24em] text-[#2b2418]">
              Account
            </h3>

            <div className="mt-5 flex flex-col gap-4">
              <FooterLink href="/login" label="Login" />
              <FooterLink href="/register" label="Register" />
              <FooterLink href="/profile" label="Profile" />
            </div>
          </div>

          {/* RESOURCES */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-[0.24em] text-[#2b2418]">
              Resources
            </h3>

            <div className="mt-5 flex flex-col gap-4">
              <a
                href="http://localhost:8000/docs"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#000000] transition hover:text-amber-700"
              >
                <span className='text-black'>

                API Docs
                </span>
              </a>

              <FooterLink href="/" label="Platform Overview" />
              <FooterLink href="/docs" label="Quick Start" />
              <FooterLink href="/pricing" label="Usage Limits" />
            </div>
          </div>
        </div>

        {/* BOTTOM */}
        <div className="flex flex-col items-center justify-between gap-5 border-t border-black/40 pt-8 text-sm text-[#6b5d49] sm:flex-row">
          <p>
            © {new Date().getFullYear()} Synapse Intelligence. All rights
            reserved.
          </p>

          <div className="flex items-center gap-6">
            <FooterLink href="/" label="Privacy" />
            <FooterLink href="/" label="Terms" />
            <FooterLink href="/" label="Security" />
          </div>
        </div>
      </div>
    </footer>
  );
}

function FooterLink({
  href,
  label,
}: {
  href: string;
  label: string;
}) {
  return (
    <Link
      href={href}
      className="text-[#6b5d49] transition duration-300 hover:text-amber-700"
    >
      <span className='text-[#000000]'>

      {label}
      </span>
    </Link>
  );
}

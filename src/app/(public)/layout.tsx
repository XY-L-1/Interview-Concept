import Link from "next/link";

function BrandMark() {
  return (
    <svg
      aria-hidden="true"
      className="size-7 text-brand"
      viewBox="0 0 32 32"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.4"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m11 8-6 8 6 8" />
      <path d="m21 8 6 8-6 8" />
      <path d="m18.5 5-5 22" />
    </svg>
  );
}

export default function PublicLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <a
        href="#main-content"
        className="sr-only z-50 bg-brand px-4 py-3 font-semibold text-white focus:not-sr-only focus:fixed focus:left-4 focus:top-4"
      >
        Skip to content
      </a>
      <header className="border-b border-line bg-white">
        <div className="mx-auto flex min-h-16 w-full max-w-[1500px] flex-wrap items-center justify-between gap-4 px-6 py-4 sm:px-10">
          <Link
            href="/"
            className="inline-flex items-center gap-3 text-lg font-semibold tracking-tight text-ink outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-4"
          >
            <BrandMark />
            <span>Interview Concept</span>
          </Link>
          <nav aria-label="Main navigation" className="flex items-center gap-5 text-sm font-medium">
            <Link href="/courses/backend-systems" className="text-muted hover:text-brand focus-visible:outline-2 focus-visible:outline-brand">Kafka &amp; Systems</Link>
            <Link href="/prepare" className="text-muted hover:text-brand focus-visible:outline-2 focus-visible:outline-brand">My preparation</Link>
          </nav>
        </div>
      </header>
      {children}
    </>
  );
}

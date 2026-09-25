
import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="grid min-h-screen place-items-center bg-slate-950 px-6 py-24 sm:py-32 lg:px-8">
      <div className="text-center">
        {/* Visual Anchor Indicator */}
        <p className="text-base font-semibold text-indigo-500 font-mono tracking-widest uppercase">
          Error 404
        </p>

        <h1 className="mt-4 text-3xl font-bold tracking-tight text-white sm:text-5xl">
          Page Not Found
        </h1>

        <p className="mt-6 text-base leading-7 text-slate-400 max-w-md mx-auto">
          The link you followed might be broken, or the route handler may have been moved during our authentication upgrade.
        </p>

        <div className="mt-10 flex items-center justify-center gap-x-6">
          <Link
            href="/"
            className="rounded-md bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 transition-colors"
          >
            Go Back Home
          </Link>

          <Link
            href="/support"
            className="text-sm font-semibold text-slate-300 hover:text-white transition-colors"
          >
            Contact Support <span aria-hidden="true">&rarr;</span>
          </Link>
        </div>
      </div>
    </main>
  );
}

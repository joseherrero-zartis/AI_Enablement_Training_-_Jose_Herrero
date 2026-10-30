import Link from "next/link";

// Shown for unknown URLs and when a page calls notFound(), e.g. a challenge slug that doesn't exist.
export default function NotFound() {
  return (
    <div className="space-y-4 rounded-lg border border-black/10 p-6 dark:border-white/15">
      <h1 className="text-2xl font-semibold">We couldn&apos;t find that page</h1>
      <p>The challenge or page you were looking for doesn&apos;t exist.</p>
      <div className="flex items-center gap-4">
        <Link
          href="/journey"
          className="rounded-md bg-black px-4 py-3 text-sm text-white hover:opacity-80 dark:bg-white dark:text-black"
        >
          Go to the journey
        </Link>
        <Link href="/" className="inline-block py-2 text-sm opacity-70 hover:opacity-100">
          Back to the dashboard
        </Link>
      </div>
    </div>
  );
}
